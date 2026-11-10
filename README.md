# HikmahGuide

HikmahGuide is a calm, dark themed web companion for reflective Islamic guidance. You ask a question in plain language and get a warm, thoughtful answer built only from the Qurʾān and authentic ḥadīth, with every source shown, linked and checkable. Your conversation continues from one question to the next, and it is still there when you come back.

Built for the **OKX.AI Hackathon** under the **Lifestyle Companion** track.

## What makes it different

The language model is never trusted to write scripture or to invent a citation. Here is how that is enforced, not just promised:

- **Qurʾān verses are fetched live** from AlQuran Cloud by surah and ayah, and each reply is checked against the verse that was asked for. The Arabic and English you see come from that source, never from the model.
- **Ḥadīth come from a curated, cited library** and every entry has been checked against an open ḥadīth dataset. Narrations that are weak, or whose citation did not match, were removed. The grade is shown next to each reference.
- **The model writes only from the sources it is handed.** It receives the retrieved verses and ḥadīth as numbered sources and must tag every religious statement, like [Q1] or [H2].
- **A guard checks every sentence the model writes.** Invented references, quotations that are not in the sources, and claims that Allah or the Prophet ﷺ said something without a source tag are removed before you see them.
- **If the model is unavailable or breaks the rules, you still get a sourced answer.** It is compiled directly from the sources, and the card says so.

For the full story see [hikmahGuide_book.md](hikmahGuide_book.md).

## Features

- Continuous chat. Follow up questions stay in the same thread, with the recent conversation as context, and new answers bring fresh sources instead of repeating old ones
- Saved history on your own device. Come back later and pick up where you left off, search your chats, rename them, delete one or all of them
- Two verses, two ḥadīth and one duʿāʾ from _Hisnul Muslim_ in every answer, each with its reference and a link to read the original
- Inline citation chips in the text. Tap [H1] and the matching source highlights
- A clear badge showing whether the answer was written from the sources or compiled directly from them
- Practical steps and key reflections, plus suggested follow up questions
- A gentle care message with a prompt to seek help if someone sounds like they may be in danger, and a note to ask a scholar when a ruling is requested
- Proof / Hash, a reproducible `SHA-256(question + timestamp)` for each answer
- Works on phones, with a keyboard, and with reduced motion settings

## How an answer is made

1. **Understand.** The model picks one to three theme keys for your question from a fixed list. A keyword lexicon backs it up, and decides alone if the model is down.
2. **Retrieve.** Verses are chosen from a Qurʾān topic index and fetched live. Ḥadīth and duʿāʾ are chosen from the curated libraries. Sources already shown in the chat are skipped.
3. **Write.** The model writes the reflection from those numbered sources only.
4. **Check.** The guard removes anything the sources do not back. If too little is left, the answer is compiled from the sources instead.
5. **Show.** The card shows the answer with citation chips, the source cards, and how it was made.

## Tech stack

- React 19 and TypeScript, built with Vite
- A Vercel serverless function for the one API route
- Groq (`llama-3.3-70b-versatile` by default) for the writing step
- AlQuran Cloud for verses
- Vitest for tests
- Web Crypto for the proof hash, and local storage for chat history

## Project structure

```
api/guidance.ts            The only API route. A thin adapter around server/handler.ts
server/handler.ts          Validation, rate limit, timeout, error handling
server/service.ts          The pipeline: classify, retrieve, write, check, assemble
server/guard.ts            The citation guard for model output
server/prompts.ts          The classifier and writer prompts
server/quranClient.ts      Live verse fetching with validation, caching and retries
server/sources.ts          Retrieval from the libraries
server/compose.ts          Answers compiled directly from sources
server/data/               Curated libraries: ḥadīth, grades, duʿāʾ, Qurʾān index, themes
src/shared/                Types, link builders and validators used by both sides
src/lib/chatStore.ts       Chat history: saving, restoring, limits, cross tab sync
src/lib/storage.ts         Validated local storage
src/lib/api.ts             Client for the API
src/components/            Sidebar, thread, answer card, composer, landing page
src/app.css                Design tokens and layout
tests/                     Unit tests, plus the live source audit
vercel.json                Security headers and function settings
```

## Getting started

```bash
npm install
cp .env.example .env     # optional, add your GROQ_API_KEY
npm run dev
```

Open the local URL Vite prints. The dev server runs the same API handler as production, so you get real answers. Without a Groq key, answers are compiled directly from the verified sources.

Useful commands:

```bash
npm test                 # unit tests
npm run build            # type check and production build
npm run audit:sources    # live check of every verse, ḥadīth and duʿāʾ (needs internet)
```

## Environment variables

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Key for the writing model. Optional, the app works without it. Keep it secret, never prefix it with `VITE_` |
| `GROQ_MODEL` | Optional model name, defaults to `llama-3.3-70b-versatile` |
| `QURAN_API_BASE` | Optional, only to point at a mirror of AlQuran Cloud |

`VITE_GROQ_API_KEY` is still read so older deployments keep working, but it logs a warning. Please rename it to `GROQ_API_KEY`.

## Privacy and security

- Chats are saved in your browser only. There is no account and no chat database. Your question is sent to the API route and on to the model provider to be answered, and is not stored by this app.
- Everything read back from local storage is validated again, so a damaged or edited record is skipped instead of shown.
- All model and stored text is rendered as plain text. Source links are rebuilt from validated numbers and only ever point to sunnah.com and quran.com.
- The API validates every field, limits sizes, rate limits each client, hides internal errors and never caches answers.
- `vercel.json` sets a strict Content Security Policy and other security headers.

The rate limiter lives in memory. On a serverless platform each instance has its own counter, so treat it as a brake against runaway loops, not a hard guarantee. For a strict limit, add Vercel firewall rate limiting or a shared store such as Upstash in front of `/api/guidance`.

## Sources

- **Qurʾān**: [AlQuran Cloud](https://alquran.cloud), `quran-uthmani` for Arabic and `en.sahih` (Saheeh International) for English
- **Ḥadīth**: Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan al-Tirmidhī, Sunan Abī Dāwūd, Sunan an-Nasā’ī, Sunan Ibn Mājah and Musnad Aḥmad, with sunnah.com style numbers. Checked against the open [hadith-api](https://github.com/fawazahmed0/hadith-api) dataset
- **Duʿāʾ**: _Hisnul Muslim_ (Fortress of the Muslim), each paired with the narration or verse it comes from

Two Musnad Aḥmad entries (2803 and 8952) are not in the open dataset, so they are not auto checked, have no grade label and no link. Please verify them by hand before a public release. Every other entry passes `npm run audit:sources`.

## Deployment

Made for **Vercel**. Set `GROQ_API_KEY` in the project settings and deploy. `vercel.json` gives the API function 30 seconds and adds the security headers. The front end alone can be served from any static host (`npm run build`, output in `dist`), but the API route needs a server.

## Disclaimer

HikmahGuide is a tool for reflection and educational support. It does not issue fatwas, does not predict the future, and is not a substitute for qualified Islamic scholarship on legal or religious rulings. For binding rulings, please consult a knowledgeable scholar.
