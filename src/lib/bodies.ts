import bodiesData from "../../data/bodies.json";

export type Lang = "sv" | "fi" | "en";

export interface Member {
  name: string;
  role_sv: string;
  role_fi: string;
  role_en: string;
  party: string | null;
  email: string | null;
  phone: string | null;
  source_url: string;
}

export interface Body {
  id: string;
  name_sv: string;
  name_fi: string;
  name_en: string;
  remit_sv: string;
  remit_fi: string;
  remit_en: string;
  topics_sv: string[];
  topics_fi: string[];
  topics_en: string[];
  source_url_fi: string;
  source_url_sv: string;
  source_url_en: string;
  registry_email: string;
  members: Member[];
}

export interface BodiesFile {
  fetched_at: string;
  source: string;
  disclaimer_sv: string;
  disclaimer_fi: string;
  disclaimer_en: string;
  bodies: Body[];
}

const data = bodiesData as BodiesFile;

export const BODIES: Body[] = data.bodies;

export function getBody(id: string): Body | undefined {
  return BODIES.find((b) => b.id === id);
}

// Language-aware helpers so the UI never has to branch on language itself.
export function bodyName(body: Body, lang: Lang): string {
  return lang === "sv" ? body.name_sv : lang === "en" ? body.name_en : body.name_fi;
}

export function bodyRemit(body: Body, lang: Lang): string {
  return lang === "sv" ? body.remit_sv : lang === "en" ? body.remit_en : body.remit_fi;
}

export function bodySourceUrl(body: Body, lang: Lang): string {
  return lang === "sv" ? body.source_url_sv : lang === "en" ? body.source_url_en : body.source_url_fi;
}

export function memberRole(member: Member, lang: Lang): string {
  return lang === "sv" ? member.role_sv : lang === "en" ? member.role_en : member.role_fi;
}

/**
 * The compact list we hand to the routing model. It contains ONLY id, name,
 * remit and topics — never member names or contact details. This keeps the
 * model's job to "pick an id from this list" and means it can never invent or
 * corrupt a person or an email address.
 */
export function bodiesForPrompt(lang: Lang): string {
  return BODIES.map((b) => {
    const name = bodyName(b, lang);
    const remit = bodyRemit(b, lang);
    const topics = (lang === "sv" ? b.topics_sv : lang === "en" ? b.topics_en : b.topics_fi).join(", ");
    return `- id: ${b.id}\n  name: ${name}\n  remit: ${remit}\n  example_topics: ${topics}`;
  }).join("\n");
}
