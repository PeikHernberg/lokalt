"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getBody,
  bodyName,
  bodySourceUrl,
  memberRole,
  type Lang,
  type Body,
} from "@/lib/bodies";
import { strings } from "@/lib/i18n";

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

interface Recipient {
  email: string;
  name: string;
  role: string;
  bodyName: string;
}

interface Draft {
  subject: string;
  body: string;
  recipient: Recipient;
}

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
  const [routing, setRouting] = useState<RoutingResult | null>(null);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setRouting(null);
    setSelectedBodyId(null);
    setDraft(null);
    try {
      const res = await fetch("/api/route-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as RoutingResult;
      setRouting(data);
      // Auto-select the first match once routing resolves.
      setSelectedBodyId(data.matches[0]?.body_id ?? null);
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
          bodyName: bodyName(body, lang),
          recipientName: recipient.name,
          recipientRole: recipient.role,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { subject: string; body: string };
      setDraft({ subject: data.subject, body: data.body, recipient });
      // Bring the draft into view on narrow screens where it stacks below.
      setTimeout(() => {
        document.getElementById("draft")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch {
      setError(t.error);
    } finally {
      setDrafting(false);
    }
  }

  function handleCopy() {
    if (!draft) return;
    const text = `${t.subjectLabel}: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const confidenceLabel = (c: Match["confidence"]) =>
    c === "high" ? t.confidenceHigh : c === "medium" ? t.confidenceMedium : t.confidenceLow;

  const confidenceClass = (c: Match["confidence"]) =>
    c === "high"
      ? "bg-petrol text-white"
      : c === "medium"
        ? "border border-petrol/40 text-petrol"
        : "bg-neutral-200 text-neutral-700";

  const hasMatches = !!routing && routing.matches.length > 0;

  const selectedMatch =
    routing && selectedBodyId
      ? routing.matches.find((m) => m.body_id === selectedBodyId) ?? null
      : null;
  const selectedBody = selectedMatch ? getBody(selectedMatch.body_id) ?? null : null;
  const chair = selectedBody?.members[0] ?? null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-8">
        <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-neutral-700">{t.tagline}</p>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        )}

        {/* Workbench: candidate list (left) + acted-on detail (right) */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* ── Left column: question + candidates ─────────────────── */}
          <div className="md:w-[300px] md:flex-shrink-0 md:border-r md:border-line md:pr-6">
            <form onSubmit={handleAsk}>
              <label htmlFor="q" className="block text-sm font-medium">
                {t.askHeading}
              </label>
              <textarea
                id="q"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t.askPlaceholder}
                rows={3}
                className="mt-2 w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-petrol"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="mt-3 w-full rounded-lg bg-petrol px-5 py-3 font-medium text-white transition hover:bg-petrol-dark disabled:opacity-50"
              >
                {loading ? t.thinking : t.askButton}
              </button>
            </form>

            {hasMatches && (
              <>
                <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  {t.resultHeading}
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  {routing!.matches.map((m) => {
                    const body = getBody(m.body_id);
                    if (!body) return null;
                    const isSelected = m.body_id === selectedBodyId;
                    return (
                      <button
                        key={m.body_id}
                        type="button"
                        onClick={() => {
                          setSelectedBodyId(m.body_id);
                          setDraft(null);
                        }}
                        aria-pressed={isSelected}
                        className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                          isSelected
                            ? "border-petrol bg-petrol/5"
                            : "border-line bg-transparent hover:bg-neutral-50"
                        }`}
                      >
                        <span className="text-[13.5px] font-medium text-ink">
                          {bodyName(body, lang)}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${confidenceClass(
                            m.confidence,
                          )}`}
                        >
                          {confidenceLabel(m.confidence)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Right column: detail + draft ───────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* National matter banner */}
            {routing?.national && (
              <div className="mb-4 rounded-lg border border-line bg-white px-4 py-4 text-[15px]">
                {t.nationalNote}
              </div>
            )}

            {selectedBody && selectedMatch ? (
              <>
                <article className="rounded-xl border border-line bg-white p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-petrol">
                    {bodyName(selectedBody, lang)}
                  </h2>
                  <p className="mt-2 text-[15px] text-neutral-700">
                    {lang === "sv" ? selectedMatch.reason_sv : selectedMatch.reason_fi}
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Chair cell — only if a chair email is published */}
                    {chair?.email && (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-500">
                          {t.chairBadge}
                        </div>
                        <div className="mt-1 text-sm font-medium text-ink">{chair.name}</div>
                        <div className="text-[12.5px] text-neutral-600">
                          {memberRole(chair, lang)}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleWrite(selectedBody, {
                              email: chair.email!,
                              name: chair.name,
                              role: memberRole(chair, lang),
                              bodyName: bodyName(selectedBody, lang),
                            })
                          }
                          disabled={drafting}
                          className="mt-2 rounded-md bg-petrol px-3 py-1.5 text-sm font-medium text-white transition hover:bg-petrol-dark disabled:opacity-50"
                        >
                          {drafting ? t.drafting : t.writeButton}
                        </button>
                      </div>
                    )}

                    {/* Registry cell — always available */}
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-neutral-500">
                        {t.registryLabel}
                      </div>
                      <div className="mt-1 text-sm font-medium text-ink">
                        {selectedBody.registry_email}
                      </div>
                      <div className="text-[12.5px] text-neutral-600">{t.registryHint}</div>
                      <button
                        type="button"
                        onClick={() =>
                          handleWrite(selectedBody, {
                            email: selectedBody.registry_email,
                            name: "",
                            role: "",
                            bodyName: bodyName(selectedBody, lang),
                          })
                        }
                        disabled={drafting}
                        className="mt-2 rounded-md border border-petrol px-3 py-1.5 text-sm font-medium text-petrol transition hover:bg-petrol/5 disabled:opacity-50"
                      >
                        {drafting ? t.drafting : t.writeButton}
                      </button>
                    </div>
                  </div>

                  <a
                    href={bodySourceUrl(selectedBody, lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block text-xs text-neutral-500 underline underline-offset-2 hover:text-petrol"
                  >
                    {t.source}
                  </a>
                </article>

                {/* Draft panel */}
                {draft && (
                  <div
                    id="draft"
                    className="mt-5 scroll-mt-6 border-t border-line pt-5"
                  >
                    <p className="text-sm text-neutral-600">
                      {t.recipientLabel}:{" "}
                      <span className="font-medium text-ink">
                        {draft.recipient.name ? `${draft.recipient.name} — ` : ""}
                        {draft.recipient.email}
                      </span>
                    </p>

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
                      rows={7}
                      className="mt-1 w-full resize-y rounded-md border border-line px-3 py-2 text-[15px] leading-relaxed outline-none focus:border-petrol"
                    />

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <a
                        href={mailtoHref(draft.recipient.email, draft.subject, draft.body)}
                        className="rounded-lg bg-petrol px-5 py-3 text-center font-medium text-white transition hover:bg-petrol-dark"
                      >
                        {t.openMail}
                      </a>
                      <button
                        onClick={handleCopy}
                        className="rounded-lg border border-line px-5 py-3 font-medium text-ink transition hover:bg-neutral-50"
                      >
                        {copied ? t.copied : t.copy}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : routing?.unclear && !hasMatches ? (
              <div className="rounded-xl border border-line bg-white p-6">
                <h2 className="font-medium">{t.clarifyHeading}</h2>
                <p className="mt-1 text-[15px] text-neutral-700">
                  {lang === "sv" ? routing.clarifying_question_sv : routing.clarifying_question_fi}
                </p>
              </div>
            ) : (
              !routing?.national && (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-line px-6 py-16 text-center">
                  <p className="max-w-xs text-[15px] text-neutral-500">{t.emptyState}</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 py-6 text-sm text-neutral-600">
          <Link href="/om" className="text-petrol underline underline-offset-4">
            {t.aboutLink}
          </Link>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            {lang === "sv"
              ? "Oberoende verktyg, inte en officiell tjänst från Helsingfors stad. AI:n kan ha fel — kontrollera alltid källänken."
              : "Riippumaton työkalu, ei Helsingin kaupungin virallinen palvelu. Tekoäly voi erehtyä — tarkista aina lähdelinkki."}
          </p>
        </div>
      </footer>
    </div>
  );
}
