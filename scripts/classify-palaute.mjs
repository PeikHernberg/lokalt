#!/usr/bin/env node
// Classifies feedback_reports rows into a fixed taxonomy, as a separate step
// after ingestion (never in the same transaction — a failed classification
// must never block raw data landing). See 02-byggordning.md step 4.
//
// Run with: node scripts/classify-palaute.mjs

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

function loadEnvLocal() {
  try {
    const content = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {
    // Assume the vars are already in the environment.
  }
}
loadEnvLocal();

const TAXONOMY = [
  "gatuunderhall",
  "sno_och_halka",
  "belysning",
  "nedskrapning_och_graffiti",
  "parkering",
  "trafik_och_skyltar",
  "park_och_gronomraden",
  "lekplats_och_idrott",
  "kollektivtrafik",
  "vatten_och_avlopp",
  "byggande_och_buller",
  "ovrigt",
];

const BATCH_SIZE = 50;
const MODEL = "claude-haiku-4-5-20251001"; // billig modell, per spec — only ever tags a fixed taxonomy.

const SYSTEM_PROMPT = `Classify each Helsinki fault-report description into exactly one category from this fixed list:
${TAXONOMY.join(", ")}

Descriptions are almost always in Finnish. Return ONLY a JSON array, no prose, no markdown fences, one object per input item in the same order:
[{"id": "<the id you were given>", "category": "<one of the list above>", "confidence": <number 0 to 1>}]

If nothing fits well, use "ovrigt" with low confidence. Never invent a category outside the list.`;

function loadEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} saknas (se .env.local).`);
  return value;
}

async function classifyBatch(client, items) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: "disabled" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(items) }],
  });
  const text = message.content.find((b) => b.type === "text")?.text ?? "[]";
  const cleaned = text.trim().replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned);
}

async function main() {
  const supabase = createClient(loadEnv("SUPABASE_URL"), loadEnv("SUPABASE_ANON_KEY"));
  const anthropic = new Anthropic({ apiKey: loadEnv("ANTHROPIC_API_KEY") });

  let totalClassified = 0;

  for (;;) {
    const { data: rows, error } = await supabase
      .from("feedback_reports")
      .select("service_request_id, description")
      .is("category", null)
      .neq("description", "")
      .limit(BATCH_SIZE);

    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) break;

    const items = rows.map((r) => ({ id: r.service_request_id, description: r.description }));
    const results = await classifyBatch(anthropic, items);

    for (const result of results) {
      const category = TAXONOMY.includes(result.category) ? result.category : "ovrigt";
      const confidence = Number.isFinite(result.confidence) ? Math.max(0, Math.min(1, result.confidence)) : 0.5;
      const { error: updateError } = await supabase
        .from("feedback_reports")
        .update({ category, category_confidence: confidence })
        .eq("service_request_id", result.id);
      if (updateError) console.error(`${result.id}: kunde inte spara — ${updateError.message}`);
    }

    totalClassified += results.length;
    console.log(`Klassificerade ${results.length} (totalt: ${totalClassified})`);
  }

  console.log(`\nKlar. ${totalClassified} poster klassificerade.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
