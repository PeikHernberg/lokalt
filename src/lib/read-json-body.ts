import type { NextRequest } from "next/server";

/**
 * Reads a JSON request body with a hard ceiling on its size.
 *
 * `req.json()` buffers whatever arrives before any of the routes' own
 * length checks (MAX_QUESTION_LENGTH and friends) get to run, so those checks
 * can only reject a large payload after it has already been held in memory.
 * The largest thing any route legitimately accepts is a 2000-character
 * question, so 32 KB leaves generous room for the surrounding JSON and still
 * makes a megabyte-sized body cost nothing to refuse.
 *
 * Returns null for anything that isn't a JSON object within the cap; every
 * caller already treats a null/!object body as a 400.
 */
const MAX_BODY_BYTES = 32 * 1024;

export async function readJsonBody(req: NextRequest): Promise<Record<string, unknown> | null> {
  // Cheap path: if the sender declared a size, believe a declared-too-big
  // and refuse before reading a byte.
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return null;

  const body = req.body;
  if (!body) return null;

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      // A missing or lying content-length is caught here instead.
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const parsed = JSON.parse(new TextDecoder().decode(merged));
    // Only a plain object is ever a valid request here — an array or a bare
    // scalar would sail past `body?.field` checks as undefined.
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}
