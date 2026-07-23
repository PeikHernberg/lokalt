import Anthropic from "@anthropic-ai/sdk";

// The model used for both the routing and the drafting calls.
// `claude-sonnet-5` is the current Sonnet model: capable, fast and low-cost —
// plenty for choosing among a handful of bodies and writing a short email.
// Change this single constant if you ever want a different model.
export const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

/**
 * Returns a shared Anthropic client, or throws a clear error if the key is
 * missing. All calls happen server-side (in /api routes), so the key is read
 * from the ANTHROPIC_API_KEY environment variable and never reaches the browser.
 */
export function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Pulls the first block of plain text out of a Claude response.
 */
export function firstText(message: Anthropic.Message): string {
  for (const block of message.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

/**
 * Claude is asked to return only JSON, but we parse defensively: strip any
 * accidental ```json fences before parsing so a stray fence never breaks us.
 */
export function parseJsonLoose<T>(raw: string): T {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
  }
  return JSON.parse(s) as T;
}
