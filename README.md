# Helppo

A small civic tool for Helsinki residents. You type a real-world problem in your
own words — _"cykelvägen utanför mitt hus är trasig"_, _"skolmaten i min dotters
skola"_ — and Helppo answers three questions:

1. **Which body decides this?** (which lautakunta / nämnd)
2. **Who to contact** — the chair (a published office-holder) and the city
   registry route.
3. **What to write** — a short, polite draft email you edit and send from your
   own mail app.

Helppo never sends email. It builds a `mailto:` link that opens your own mail
client with everything pre-filled. No accounts, no login, no tracking, no
cookies.

Swedish and Finnish, with Swedish as the default.

> **Independent tool, not an official City of Helsinki service.** All data comes
> from the city's public decision-making pages at
> [paatokset.hel.fi](https://paatokset.hel.fi). The AI can be wrong — always
> check the source link on each card before sending anything.

---

## What's inside

| Path                              | What it is                                                       |
| --------------------------------- | --------------------------------------------------------------- |
| `data/bodies.json`                | Hand-curated seed: the 6 everyday bodies, chairs, contact routes |
| `src/lib/bodies.ts`               | Types + helpers for reading the seed                            |
| `src/lib/i18n.ts`                 | All Swedish/Finnish UI text                                     |
| `src/lib/anthropic.ts`            | Claude client + the model constant                             |
| `src/app/api/route-question/`     | Server route: picks the responsible body (Claude call #1)       |
| `src/app/api/draft/`              | Server route: writes the email draft (Claude call #2)          |
| `src/app/page.tsx`                | The whole Ask → Result → Draft page                            |
| `src/app/om/page.tsx`             | The honest "About" page                                        |

The AI only ever **chooses a body id** and **writes prose**. Member names and
email addresses are looked up in our own code from `data/bodies.json` — the model
never touches them, so it cannot invent or corrupt a contact.

---

## Run it on your own computer

You need **Node.js 18.18 or newer** installed (https://nodejs.org — the "LTS"
download is fine).

### 1. Get an Anthropic API key

1. Go to https://console.anthropic.com and sign in (or create an account).
2. Open **Settings → API keys** and click **Create key**. Copy it — it starts
   with `sk-ant-`.
3. You'll paste it in the next step. (An API key is how the app is allowed to
   use Claude; it also means usage is billed to your account — this app makes
   two short calls per question, so it's inexpensive.)

### 2. Add the key

In the project folder, copy the example file and paste your key into it:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` in a text editor and put your key after the `=`:

```
ANTHROPIC_API_KEY=sk-ant-...your key here...
```

`.env.local` is git-ignored, so your key is never committed.

### 3. Install and start

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

That's it. Type a problem, pick a body, and Helppo drafts the email.

---

## Deploy to Vercel (put it online)

1. Push this project to a GitHub repository.
2. Go to https://vercel.com and sign in with GitHub.
3. Click **Add New → Project**, pick this repository, and click **Import**.
4. Before deploying, open **Environment Variables** and add one:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your `sk-ant-...` key
5. Click **Deploy**. After a minute you get a public URL.

If you change the key later: Vercel → your project → **Settings → Environment
Variables**, then redeploy.

---

## Notes for the next phase

`data/bodies.json` is a small hand-built seed covering the 6 bodies an ordinary
resident needs. It intentionally contains only verifiable, published data:
official body names, the 2025–2029 term chairs (deputy mayors / mayor, who are
published office-holders), and the city registry route on every body. When the
live data-fetch phase replaces this seed, the `paatokset.hel.fi` source URLs
should be re-verified.
