import { NextRequest, NextResponse } from "next/server";
import { getClient, MODEL, firstText, parseJsonLoose } from "@/lib/anthropic";
import { bodiesForPrompt, type Lang } from "@/lib/bodies";

export const runtime = "nodejs";

interface Match {
  body_id: string;
  confidence: "high" | "medium" | "low";
  reason_sv: string;
  reason_fi: string;
}

interface RoutingResult {
  matches: Match[];
  unclear: boolean;
  clarifying_question_sv: string | null;
  clarifying_question_fi: string | null;
  national: boolean;
}

const SYSTEM = `You are the routing engine for "Helppo", a tool that helps Helsinki residents find which municipal body decides on an everyday problem.

You are given the resident's question and the FULL list of available bodies (with id, name, remit and example topics). Follow these rules strictly:

- Choose only from the supplied list. NEVER invent a body or an id that is not in the list.
- Return at most three matches, best first.
- If the question is too vague to route confidently (e.g. just "the school" / "skolan"), set "unclear": true and supply one short clarifying question (in both Swedish and Finnish). In that case return an empty "matches" array.
- If the question is clearly about a NATIONAL matter, not a municipal one (e.g. taxes, immigration law, national healthcare legislation, courts, police criminal matters), set "national": true and return an empty "matches" array. This is a legitimate, useful answer.
- confidence is "high", "medium" or "low". If confidence is not high, prefer returning 2–3 candidates so the user can choose.
- reason_sv and reason_fi are ONE short plain-language sentence each, explaining why this body is responsible, written for an ordinary resident.

Return ONLY valid JSON, no prose and no markdown fences, in exactly this shape:
{
  "matches": [
    { "body_id": "...", "confidence": "high|medium|low", "reason_sv": "...", "reason_fi": "..." }
  ],
  "unclear": false,
  "clarifying_question_sv": null,
  "clarifying_question_fi": null,
  "national": false
}`;

export async function POST(req: NextRequest) {
  let question: string;
  let lang: Lang;
  try {
    const body = await req.json();
    question = String(body.question ?? "").trim();
    lang = body.lang === "fi" ? "fi" : "sv";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!question) {
    return NextResponse.json({ error: "empty_question" }, { status: 400 });
  }

  const userContent = `Resident's question (language: ${lang}):
"""
${question}
"""

Available bodies:
${bodiesForPrompt(lang)}`;

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      system: SYSTEM,
      messages: [{ role: "user", content: userContent }],
    });

    const result = parseJsonLoose<RoutingResult>(firstText(message));

    // Defensive: drop any match whose body_id is not one we actually know.
    // The model must never surface an id we can't look up in our own data.
    const { BODIES } = await import("@/lib/bodies");
    const knownIds = new Set(BODIES.map((b) => b.id));
    result.matches = (result.matches ?? []).filter((m) => knownIds.has(m.body_id)).slice(0, 3);

    return NextResponse.json(result);
  } catch (err) {
    const missingKey = err instanceof Error && err.message.includes("ANTHROPIC_API_KEY");
    return NextResponse.json(
      { error: missingKey ? "missing_api_key" : "model_error" },
      { status: missingKey ? 500 : 502 },
    );
  }
}
