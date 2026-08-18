"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getBody,
  bodyName,
  bodyRemit,
  bodySourceUrl,
  memberRole,
  type Lang,
  type Body,
  type Member,
} from "@/lib/bodies";
import { strings } from "@/lib/i18n";

type Track = "operational" | "policy" | "statutory" | "agenda";

interface ClassifyResult {
  track: Track;
  body_id: string | null;
  confidence: "high" | "low";
  sensitive: boolean;
}

interface Recipient {
  email: string;
  name: string;
  role: string;
  bodyName: string;
}

interface Draft {
  subject: string;
  body: string;
  // null for the "agenda" track, which has no fixed recipient.
  recipient: Recipient | null;
}

const FELANMALAN_URL = "https://palautteet.hel.fi/";
const OMASTADI_URL = "https://omastadi.hel.fi/";
const KUNTALAISALOITE_URL = "https://www.kuntalaisaloite.fi/";

function mailtoHref(email: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("sv");
  const t = strings(lang);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [classification, setClassification] = useState<ClassifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setClassification(null);
    setDraft(null);
    try {
      const res = await fetch("/api/route-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
      });
      if (!res.ok) throw new Error("request failed");
      setClassification((await res.json()) as ClassifyResult);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleWrite(body: Body, recipient: Recipient) {
    setDrafting(true);
    setError(null);
    setDraft(null);
    setCopied(false);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          lang,
          mode: "policy",
          bodyName: bodyName(body, lang),
          recipientName: recipient.name,
          recipientRole: recipient.role,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { subject: string; body: string };
      setDraft({ subject: data.subject, body: data.body, recipient });
      scrollToDraft();
    } catch {
      setError(t.error);
    } finally {
      setDrafting(false);
    }
  }

  async function handleAgendaDraft() {
    setDrafting(true);
    setError(null);
    setDraft(null);
    setCopied(false);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang, mode: "agenda" }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { subject: string; body: string };
      setDraft({ subject: data.subject, body: data.body, recipient: null });
      scrollToDraft();
    } catch {
      setError(t.error);
    } finally {
      setDrafting(false);
    }
  }

  function scrollToDraft() {
    setTimeout(() => {
      document.getElementById("draft")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function handleCopy() {
    if (!draft) return;
    const text = `${t.subjectLabel}: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function startOver() {
    setDraft(null);
    setClassification(null);
    setQuestion("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // The statutory branch also covers any track flagged "sensitive" —
  // personal/health/social-care content must never reach a named
  // office-holder, regardless of which track it was classified into.
  const showStatutory =
    classification && (classification.track === "statutory" || classification.sensitive);
  const showOperational = classification && !showStatutory && classification.track === "operational";
  const showPolicy = classification && !showStatutory && classification.track === "policy";
  const showAgenda = classification && !showStatutory && classification.track === "agenda";
  const policyBody = showPolicy && classification.body_id ? getBody(classification.body_id) : undefined;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <span className="text-lg font-semibold tracking-tight text-petrol">Lokalt</span>
          <div className="flex items-center gap-1 text-sm" role="group" aria-label={t.langLabel}>
            <button
              onClick={() => setLang("sv")}
              className={`rounded px-2 py-1 ${lang === "sv" ? "bg-petrol text-white" : "text-neutral-600"}`}
              aria-pressed={lang === "sv"}
            >
              SV
            </button>
            <button
              onClick={() => setLang("fi")}
              className={`rounded px-2 py-1 ${lang === "fi" ? "bg-petrol text-white" : "text-neutral-600"}`}
              aria-pressed={lang === "fi"}
            >
              FI
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded px-2 py-1 ${lang === "en" ? "bg-petrol text-white" : "text-neutral-600"}`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24">
        {/* 1. ASK */}
        <section className="pt-10">
          <p className="text-[15px] leading-relaxed text-neutral-700">{t.tagline}</p>
          <form onSubmit={handleAsk} className="mt-6">
            <label htmlFor="q" className="block text-lg font-medium">
              {t.askHeading}
            </label>
            <textarea
              id="q"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={2000}
              placeholder={t.askPlaceholder}
              rows={3}
              className="mt-3 w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-base outline-none focus:border-petrol"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="mt-3 w-full rounded-lg bg-petrol px-5 py-3 font-medium text-white transition hover:bg-petrol-dark disabled:opacity-50 sm:w-auto"
            >
              {loading ? t.thinking : t.askButton}
            </button>
          </form>
        </section>

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        )}

        {/* 2. RESULT */}
        {classification && (
          <section className="mt-10">
            {/* statutory — and anything flagged sensitive, regardless of track */}
            {showStatutory && (
              <div className="rounded-xl border border-line bg-white p-5">
                <h2 className="text-base font-semibold text-petrol">{t.statutoryHeading}</h2>
                <p className="mt-2 text-[15px] text-neutral-700">{t.statutoryExplain}</p>
              </div>
            )}

            {/* operational — feedback service, no committee involved */}
            {showOperational && (
              <div className="rounded-xl border border-line bg-white p-5">
                <h2 className="text-base font-semibold text-petrol">{t.operationalHeading}</h2>
                <p className="mt-2 text-[15px] text-neutral-700">{t.operationalExplain}</p>
                <a
                  href={FELANMALAN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-lg bg-petrol px-5 py-3 font-medium text-white transition hover:bg-petrol-dark"
                >
                  {t.operationalButton}
                </a>
                {classification.confidence === "low" && (
                  <p className="mt-4 border-t border-line pt-4 text-sm text-neutral-600">
                    {t.operationalLowConfidenceNote}
                  </p>
                )}
              </div>
            )}

            {/* policy — a single committee/body, same card as before */}
            {showPolicy && (
              <>
                <h2 className="text-lg font-medium">{t.resultHeading}</h2>
                {classification.confidence === "low" && (
                  <p className="mt-1 text-sm text-neutral-600">{t.policyLowConfidenceNote}</p>
                )}
                {policyBody ? (
                  <div className="mt-4">
                    <BodyCard
                      body={policyBody}
                      lang={lang}
                      t={t}
                      onWrite={handleWrite}
                      drafting={drafting}
                    />
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg border border-line bg-white px-4 py-4 text-[15px] text-neutral-700">
                    {t.policyLowConfidenceNote}
                  </p>
                )}
              </>
            )}

            {/* agenda — a new idea, not yet on the city's agenda */}
            {showAgenda && (
              <div className="rounded-xl border border-line bg-white p-5">
                <h2 className="text-base font-semibold text-petrol">{t.agendaHeading}</h2>
                <p className="mt-2 text-[15px] text-neutral-700">{t.agendaExplain}</p>
                <ul className="mt-3 space-y-2 text-[15px]">
                  <li>
                    <a
                      href={OMASTADI_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-petrol underline underline-offset-2"
                    >
                      {t.agendaOmaStadi}
                    </a>
                  </li>
                  <li>
                    <a
                      href={KUNTALAISALOITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-petrol underline underline-offset-2"
                    >
                      {t.agendaInitiative}
                    </a>
                  </li>
                  <li className="text-neutral-700">{t.agendaCouncillor}</li>
                </ul>
                <button
                  onClick={handleAgendaDraft}
                  disabled={drafting}
                  className="mt-4 rounded-lg bg-petrol px-5 py-3 font-medium text-white transition hover:bg-petrol-dark disabled:opacity-50"
                >
                  {drafting ? t.drafting : t.agendaDraftButton}
                </button>
              </div>
            )}
          </section>
        )}

        {/* 3. DRAFT */}
        {draft && (
          <section id="draft" className="mt-12 scroll-mt-6">
            <h2 className="text-lg font-medium">
              {draft.recipient ? t.draftHeading : t.agendaDraftHeading}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {draft.recipient ? t.draftIntro : t.agendaDraftIntro}
            </p>

            <div className="mt-4 rounded-lg border border-line bg-white p-4">
              {draft.recipient && (
                <p className="text-sm text-neutral-600">
                  {t.recipientLabel}:{" "}
                  <span className="font-medium text-ink">
                    {draft.recipient.name ? `${draft.recipient.name}, ` : ""}
                    {draft.recipient.email}
                  </span>
                </p>
              )}

              <label className="mt-4 block text-sm font-medium">{t.subjectLabel}</label>
              <input
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-[15px] outline-none focus:border-petrol"
              />

              <label className="mt-4 block text-sm font-medium">{t.bodyLabel}</label>
              <textarea
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                rows={12}
                className="mt-1 w-full resize-y rounded-md border border-line px-3 py-2 text-[15px] leading-relaxed outline-none focus:border-petrol"
              />

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {draft.recipient && (
                  <a
                    href={mailtoHref(draft.recipient.email, draft.subject, draft.body)}
                    className="rounded-lg bg-petrol px-5 py-3 text-center font-medium text-white transition hover:bg-petrol-dark"
                  >
                    {t.openMail}
                  </a>
                )}
                <button
                  onClick={handleCopy}
                  className="rounded-lg border border-line px-5 py-3 font-medium text-ink transition hover:bg-neutral-50"
                >
                  {copied ? t.copied : t.copy}
                </button>
              </div>
            </div>

            <button
              onClick={startOver}
              className="mt-6 text-sm text-petrol underline underline-offset-4"
            >
              {t.startOver}
            </button>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-2xl px-5 py-6 text-sm text-neutral-600">
          <Link href="/om" className="text-petrol underline underline-offset-4">
            {t.aboutLink}
          </Link>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">{t.footerDisclaimer}</p>
        </div>
      </footer>
    </div>
  );
}

function BodyCard({
  body,
  lang,
  t,
  onWrite,
  drafting,
}: {
  body: Body;
  lang: Lang;
  t: ReturnType<typeof strings>;
  onWrite: (body: Body, recipient: Recipient) => void;
  drafting: boolean;
}) {
  return (
    <article className="rounded-xl border border-line bg-white p-5">
      <h3 className="text-base font-semibold text-petrol">{bodyName(body, lang)}</h3>
      <p className="mt-2 text-[15px] text-neutral-700">{bodyRemit(body, lang)}</p>

      {/* Named members (chair) */}
      {body.members.map((member: Member, i) => (
        <div key={i} className="mt-4 rounded-lg bg-paper p-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{member.name}</span>
            {i === 0 && (
              <span className="rounded bg-petrol/10 px-1.5 py-0.5 text-[11px] font-medium text-petrol">
                {t.chairBadge}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-600">{memberRole(member, lang)}</p>
          {member.party && <p className="text-sm text-neutral-500">{member.party}</p>}
          {member.email ? (
            <p className="mt-1 text-sm">
              <a href={`mailto:${member.email}`} className="text-petrol underline underline-offset-2">
                {member.email}
              </a>
            </p>
          ) : (
            <p className="mt-1 text-sm text-neutral-500">{t.noEmail}</p>
          )}
          {member.email && (
            <button
              onClick={() =>
                onWrite(body, {
                  email: member.email!,
                  name: member.name,
                  role: memberRole(member, lang),
                  bodyName: bodyName(body, lang),
                })
              }
              disabled={drafting}
              className="mt-2 rounded-md bg-petrol px-3 py-1.5 text-sm font-medium text-white transition hover:bg-petrol-dark disabled:opacity-50"
            >
              {drafting ? t.drafting : t.writeButton}
            </button>
          )}
        </div>
      ))}

      {/* Registry route — always available */}
      <div className="mt-3 rounded-lg border border-dashed border-line p-3">
        <p className="text-sm font-medium">{t.registryLabel}</p>
        <p className="mt-0.5 text-sm">
          <a href={`mailto:${body.registry_email}`} className="text-petrol underline underline-offset-2">
            {body.registry_email}
          </a>
        </p>
        <p className="mt-1 text-xs text-neutral-500">{t.registryHint}</p>
        <button
          onClick={() =>
            onWrite(body, {
              email: body.registry_email,
              name: "",
              role: "",
              bodyName: bodyName(body, lang),
            })
          }
          disabled={drafting}
          className="mt-2 rounded-md border border-petrol px-3 py-1.5 text-sm font-medium text-petrol transition hover:bg-petrol/5 disabled:opacity-50"
        >
          {drafting ? t.drafting : t.writeButton}
        </button>
      </div>

      {/* Source link — on every card, per design rule 1 */}
      <a
        href={bodySourceUrl(body, lang)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-xs text-neutral-500 underline underline-offset-2 hover:text-petrol"
      >
        {t.source}
      </a>
    </article>
  );
}
