import { NextRequest, NextResponse } from "next/server";
import { getClient, MODEL, firstText, parseJsonLoose } from "@/lib/anthropic";
import type { Lang } from "@/lib/bodies";

export const runtime = "nodejs";

interface DraftResult {
  subject: string;
  body: string;
}

const SYSTEM = `You write a short, polite, factual draft email for a Helsinki resident to send to a municipal decision-maker. You write in the FIRST PERSON as the resident.

Hard rules:
- Language: write ENTIRELY in the requested language (Swedish or Finnish).
- Length: under 150 words. Short emails get read; long ones do not.
- Tone: factual and polite. No outrage, no demands, no flattery, no threats.
- Structure: (1) who I am and roughly where I live, (2) the concrete problem, (3) what I am asking you to do, (4) a brief thank you.
- Leave obvious blanks in square brackets where the resident must add specifics, e.g. [din adress] / [osoitteesi], [gatans namn] / [kadun nimi]. Do not invent an address, a street, or personal details.
- Do NOT sign the email with a real name — end with a neutral placeholder like "[Ditt namn]" / "[Nimesi]".
- NEVER mention "Helppo", this tool, or that the email was drafted by anyone but the resident.

Return ONLY valid JSON, no prose and no markdown fences, in exactly this shape:
{ "subject": "...", "body": "..." }`;

export async function POST(req: NextRequest) {
  let question = "";
  let lang: Lang = "sv";
  let bodyName = "";
  let recipientName = "";
  let recipientRole = "";
  try {
    const b = await req.json();
    question = String(b.question ?? "").trim();
    lang = b.lang === "fi" ? "fi" : "sv";
    bodyName = String(b.bodyName ?? "").trim();
    recipientName = String(b.recipientName ?? "").trim();
    recipientRole = String(b.recipientRole ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!question || !bodyName) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const recipientLine = recipientName
    ? `Recipient: ${recipientName}${recipientRole ? ` (${recipientRole})` : ""}, at the body "${bodyName}".`
    : `Recipient: the city registry, addressed to the body "${bodyName}".`;

  const userContent = `Language to write in: ${lang}
${recipientLine}

The resident described their problem in their own words:
"""
${question}
"""

Write the subject and body of the email.`;

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      system: SYSTEM,
      messages: [{ role: "user", content: userContent }],
    });

    const result = parseJsonLoose<DraftResult>(firstText(message));
    return NextResponse.json(result);
  } catch (err) {
    const missingKey = err instanceof Error && err.message.includes("ANTHROPIC_API_KEY");
    return NextResponse.json(
      { error: missingKey ? "missing_api_key" : "model_error" },
      { status: missingKey ? 500 : 502 },
    );
  }
}
