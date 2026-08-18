import { NextRequest, NextResponse } from "next/server";
import { getClient, MODEL, firstText, parseJsonLoose } from "@/lib/anthropic";
import { CLASSIFY_SYSTEM } from "@/lib/classify-prompt";
import { bodiesForPrompt, type Lang } from "@/lib/bodies";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Longest resident text we accept: enough for any real concern, small enough
// that a scripted caller can't inflate token costs with megabyte payloads.
const MAX_QUESTION_LENGTH = 2000;

export type Track = "operational" | "policy" | "statutory" | "agenda";

interface ClassifyResult {
  track: Track;
  body_id: string | null;
  confidence: "high" | "low";
  sensitive: boolean;
}

const VALID_TRACKS: Track[] = ["operational", "policy", "statutory", "agenda"];

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let question: string;
  let lang: Lang;
  try {
    const body = await req.json();
    question = String(body.question ?? "").trim();
    lang = body.lang === "fi" ? "fi" : body.lang === "en" ? "en" : "sv";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!question) {
    return NextResponse.json({ error: "empty_question" }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: "question_too_long" }, { status: 400 });
  }

  const userContent = `Resident's text (language: ${lang}):
"""
${question}
"""

Available bodies (reference only — use only if track is "policy"):
${bodiesForPrompt(lang)}`;

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      thinking: { type: "disabled" },
      system: CLASSIFY_SYSTEM,
      messages: [{ role: "user", content: userContent }],
    });

    const result = parseJsonLoose<ClassifyResult>(firstText(message));

    if (!VALID_TRACKS.includes(result.track)) {
      throw new Error("model returned an unknown track");
    }

    // Defensive: body_id must be null unless track is "policy", and must be
    // a real, known id. The model must never surface an id we can't look up.
    if (result.track !== "policy") {
      result.body_id = null;
    } else if (result.body_id) {
      const { BODIES } = await import("@/lib/bodies");
      const knownIds = new Set(BODIES.map((b) => b.id));
      if (!knownIds.has(result.body_id)) {
        result.body_id = null;
      }
    }

    result.confidence = result.confidence === "high" ? "high" : "low";
    result.sensitive = result.sensitive === true;

    return NextResponse.json(result);
  } catch (err) {
    const missingKey = err instanceof Error && err.message.includes("ANTHROPIC_API_KEY");
    return NextResponse.json(
      { error: missingKey ? "missing_api_key" : "model_error" },
      { status: missingKey ? 500 : 502 },
    );
  }
}
