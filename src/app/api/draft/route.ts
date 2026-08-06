import { NextRequest, NextResponse } from "next/server";
import { getClient, MODEL, firstText, parseJsonLoose } from "@/lib/anthropic";
import type { Lang } from "@/lib/bodies";

export const runtime = "nodejs";

type DraftMode = "policy" | "agenda";

interface DraftResult {
  subject: string;
  body: string;
}

const SYSTEM_POLICY = `You write a short, polite, factual draft email for a Helsinki resident to send to a municipal decision-maker. You write in the FIRST PERSON as the resident.

Hard rules:
- Language: write ENTIRELY in the requested language (Swedish, Finnish, or English).
- Length: under 150 words. Short emails get read; long ones do not.
- Tone: factual and polite. No outrage, no demands, no flattery, no threats.
- Structure: (1) who I am and roughly where I live, (2) the concrete problem, (3) what I am asking you to do, (4) a brief thank you.
- Leave obvious blanks in square brackets where the resident must add specifics, e.g. [din adress] / [osoitteesi] / [your address], [gatans namn] / [kadun nimi] / [street name]. Do not invent an address, a street, or personal details.
- Do NOT sign the email with a real name — end with a neutral placeholder like "[Ditt namn]" / "[Nimesi]" / "[Your name]".
- NEVER mention "Lokalt", this tool, or that the email was drafted by anyone but the resident.

Return ONLY valid JSON, no prose and no markdown fences, in exactly this shape:
{ "subject": "...", "body": "..." }`;

const SYSTEM_AGENDA = `You write a short, factual starting text for a Helsinki resident who wants to raise a brand-new idea the city has not considered yet — e.g. for a citizens' initiative, an OmaStadi participatory-budgeting proposal, or a note to a city councillor. You write in the FIRST PERSON as the resident. There is no fixed recipient — the resident will paste this text wherever they end up submitting it.

Hard rules:
- Language: write ENTIRELY in the requested language (Swedish, Finnish, or English).
- Length: under 150 words. Short, clear proposals get read; long ones do not.
- Tone: factual and constructive. No outrage, no demands, no flattery, no threats.
- Structure: (1) the idea or proposal in one or two sentences, (2) why it would help, in concrete terms, (3) a brief, neutral closing sentence.
- Do NOT address it "Dear ..." or name any recipient — it has none yet.
- Leave obvious blanks in square brackets where the resident must add specifics, e.g. [din adress] / [osoitteesi] / [your address], [gatans namn] / [kadun nimi] / [street name]. Do not invent an address, a street, or personal details.
- Do NOT sign with a real name — end with a neutral placeholder like "[Ditt namn]" / "[Nimesi]" / "[Your name]", if a closing is needed at all.
- NEVER mention "Lokalt", this tool, or that the text was drafted by anyone but the resident.

Return ONLY valid JSON, no prose and no markdown fences, in exactly this shape:
{ "subject": "...", "body": "..." }`;

export async function POST(req: NextRequest) {
  let question = "";
  let lang: Lang = "sv";
  let bodyName = "";
  let recipientName = "";
  let recipientRole = "";
  let mode: DraftMode = "policy";
  try {
    const b = await req.json();
    question = String(b.question ?? "").trim();
    lang = b.lang === "fi" ? "fi" : b.lang === "en" ? "en" : "sv";
    bodyName = String(b.bodyName ?? "").trim();
    recipientName = String(b.recipientName ?? "").trim();
    recipientRole = String(b.recipientRole ?? "").trim();
    mode = b.mode === "agenda" ? "agenda" : "policy";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!question) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (mode === "policy" && !bodyName) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const userContent =
    mode === "agenda"
      ? `Language to write in: ${lang}

The resident described their idea in their own words:
"""
${question}
"""

Write the subject and body of the starting text.`
      : `Language to write in: ${lang}
${
  recipientName
    ? `Recipient: ${recipientName}${recipientRole ? ` (${recipientRole})` : ""}, at the body "${bodyName}".`
    : `Recipient: the city registry, addressed to the body "${bodyName}".`
}

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
      system: mode === "agenda" ? SYSTEM_AGENDA : SYSTEM_POLICY,
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
