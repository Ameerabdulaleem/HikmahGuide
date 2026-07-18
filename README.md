# HikmahGuide

HikmahGuide is a calm, dark-themed web companion that offers reflective Islamic guidance through an elegant, conversational interface. Ask a question in plain language and receive a warm, thoughtful response grounded in the way of the Prophet Muhammad ﷺ — complete with verified Qur'anic verses, authentic ḥadīth, an authentic supplication, practical steps, and a reproducible proof hash.

Built for the **OKX.AI Hackathon** under the **Lifestyle Companion** track.

## What makes it different

The language model is **never trusted to write religious text or invent citations**. Instead:

- **Qur'an verses are verified at runtime** against the AlQuran Cloud API by surah and ayah — the displayed Arabic and translation come from an authoritative source, not the model.
- **Ḥadīth are selected from a curated, source-cited local library** — the model only chooses a theme; the text and reference come from vetted data.
- **Duʿāʾ come from a curated _Hisnul Muslim_ library** — again, the model only picks a theme.

For the full story of how it works and the sources it uses, see [hikmahGuide_book.md](hikmahGuide_book.md).

## Features

- Elegant, dark, premium single-page experience
- Warm, convincing guidance rooted in the sunnah and character of the Prophet ﷺ
- **Two** distinct Qur'anic verses per response, verified against a live Qur'an API
- **Two** distinct authentic ḥadīth per response, from a curated source-cited library
- An authentic **Suggested Duʿāʾ** from _Hisnul Muslim_, shown with its source
- Practical, actionable steps for each question
- **Proof / Hash** — a reproducible `SHA-256(question + timestamp)` computed in-browser
- Reliable fallback guidance mode when the live model is unavailable

## Tech Stack

- React 19 + TypeScript
- Vite
- Groq SDK (model `llama-3.3-70b-versatile`) via a Vercel serverless function
- Axios (Qur'an verse verification)
- Lucide icons
- Web Crypto API (SHA-256 proof hash)

## Project structure

```
api/guidance.ts          Serverless function — the only place the LLM is called
src/App.tsx              UI and response rendering + proof hash
src/lib/hikmahGuide.ts   Orchestrator: model call, verse verification, selection
src/lib/islamicApi.ts    Wrapper over the AlQuran Cloud / hadith APIs
src/lib/hadithLibrary.ts Curated, theme-keyed authentic ḥadīth with citations
src/lib/duaLibrary.ts    Curated, theme-keyed Hisnul Muslim supplications
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

> Note: live guidance runs through the serverless function in production. In local dev the app serves the vetted fallback response so you can develop the UI without an API key.

### 3. Build for production
```bash
npm run build
```

## Environment Variables

Live guidance requires a Groq API key, read by the serverless function in [api/guidance.ts](api/guidance.ts):

```bash
GROQ_API_KEY=your_api_key_here
```

## Sources

- **Qur'an** — [AlQuran Cloud API](https://alquran.cloud) (`quran-uthmani` Arabic, `en.sahih` Sahih International translation)
- **Ḥadīth** — Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan al-Tirmidhī, Sunan Abī Dāwūd, Sunan Ibn Mājah, Sunan an-Nasā'ī, Musnad Aḥmad (cited with sunnah.com reference numbers)
- **Duʿāʾ** — _Hisnul Muslim_ (Fortress of the Muslim), each paired with its original Qur'an/ḥadīth source

> The ḥadīth and duʿāʾ text and citations were compiled by hand and should be spot-checked against a printed _Hisnul Muslim_ or sunnah.com before public release. Qur'an verses are verified automatically at runtime.

## Deployment

Optimized for **Vercel** (the serverless `api/guidance.ts` function deploys automatically). Also deployable to any static host for the front end:

- Build command: `npm run build`
- Output directory: `dist`

## Disclaimer

HikmahGuide is a tool for reflection and educational support. It does not issue fatwas, does not predict the future, and is not a substitute for qualified Islamic scholarship on legal or religious rulings. For binding rulings, consult a knowledgeable scholar.
