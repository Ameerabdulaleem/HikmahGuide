# HikmahGuide — The Book

_How HikmahGuide was built, how it produces guidance, and the authentic sources and libraries it relies on._

HikmahGuide is a calm, dark-themed web companion that offers reflective Islamic guidance. A user asks a question in plain language; the app responds with a warm opening, a convincing explanation rooted in the way of the Prophet Muhammad ﷺ, two Qur'anic verses, two authentic ḥadīth, practical steps, an authentic duʿāʾ, and a reproducible proof hash of the response.

This document explains how each part is made and where the material comes from.

---

## 1. What the app produces

For every question, HikmahGuide returns a single guidance card containing:

| Section | Contents |
|---|---|
| **Opening** | 2–3 warm sentences acknowledging the person's situation |
| **Main guidance** | ~150–220 words grounded in the sunnah and character of the Prophet ﷺ |
| **Key reflections** | 3–4 short reflective insights |
| **Qur'anic guidance** | **Two** distinct verses, each verified against an authentic Qur'an source |
| **Authentic ḥadīth** | **Two** distinct ḥadīth pulled from a curated, source-cited library |
| **Practical steps** | 4–5 concrete, actionable steps |
| **Suggested Duʿāʾ** | An authentic supplication from _Hisnul Muslim_, with its source |
| **Proof / Hash** | `SHA-256(question + timestamp)` — a reproducible integrity hash |

---

## 2. How it was made

### 2.1 Architecture at a glance

HikmahGuide is a single-page React + TypeScript app built with Vite. It has one serverless function that talks to the language model, and a set of local TypeScript libraries that guarantee the religious content is authentic rather than model-invented.

```
User question
      │
      ▼
  src/App.tsx ─────────────► src/lib/hikmahGuide.ts  (orchestrator)
                                   │
        ┌──────────────────────────┼───────────────────────────┐
        ▼                          ▼                            ▼
  /api/guidance.ts          src/lib/islamicApi.ts      src/lib/hadithLibrary.ts
  (Groq LLM — themes         (verifies Qur'an verses     src/lib/duaLibrary.ts
   + guidance prose)          against a live API)        (curated authentic text)
```

### 2.2 The core design decision: themes, not text

The single most important idea in HikmahGuide is this:

> **The language model is never trusted to write the Arabic text of a ḥadīth or a duʿāʾ, or to invent a citation.**

Language models are fluent but they hallucinate — they will happily produce a plausible-sounding ḥadīth with a wrong or fabricated reference number. That is unacceptable for religious content.

So the model is only asked to do what it is genuinely good at:

1. Write the reflective prose (opening, main guidance, key reflections, practical steps).
2. Cite two Qur'an verses **by surah and ayah number** — which we then independently verify.
3. Choose **theme keywords** (for ḥadīth and duʿāʾ) from a fixed allowed list.

The actual ḥadīth text, duʿāʾ text, and their citations come from **curated local libraries** that were written and checked by a human, not generated at request time.

### 2.3 The request flow

1. **User asks a question** in [src/App.tsx](src/App.tsx). A timestamp is recorded (`Date.now()`).
2. The question is sent to the serverless endpoint [api/guidance.ts](api/guidance.ts).
3. That endpoint calls the **Groq** API (model `llama-3.3-70b-versatile`) with a strict system prompt that forces a single JSON object matching a fixed schema. It returns:
   - the prose sections,
   - two Qur'an references (`surah` + `ayah` + text),
   - two `hadith_themes` from the allowed list,
   - one `dua_theme` from the allowed list.
4. Back in [src/lib/hikmahGuide.ts](src/lib/hikmahGuide.ts):
   - **Qur'an verses are verified.** Each cited verse is fetched from the AlQuran Cloud API (`getAyah`) in both Arabic (`quran-uthmani`) and English (`en.sahih`). The displayed Arabic, translation, and reference come from that authoritative source — not from the model. If verification fails, a vetted fallback verse is used.
   - **Ḥadīth are selected locally.** `selectTwoHadith(themes)` picks two distinct, source-cited ḥadīth from [src/lib/hadithLibrary.ts](src/lib/hadithLibrary.ts).
   - **The duʿāʾ is selected locally.** `selectDua(theme)` picks one authentic supplication from [src/lib/duaLibrary.ts](src/lib/duaLibrary.ts).
5. The assembled response is rendered as the guidance card, ending with the proof hash.

### 2.4 The proof / hash

Each response shows a reproducible integrity hash:

```
0x<64 hex chars>
SHA-256("<your question>" + <ISO timestamp>)
```

It is computed **client-side** using the browser's Web Crypto API (`crypto.subtle.digest('SHA-256', …)`) over the exact question text concatenated with the ISO timestamp shown. Anyone can reproduce it: take the shown question and timestamp, run SHA-256, and you get the same digest.

This demonstrates the transparency/auditability model of the OKX.AI ecosystem in the **Lifestyle Companion** track — an honest, verifiable fingerprint of the response. It is an integrity hash, not an on-chain attestation.

### 2.5 Reliability: fallback mode

If the live model is unreachable (or the app runs in local dev), HikmahGuide serves a vetted `FALLBACK` response so the user always receives coherent, source-backed guidance. The two-verse and two-ḥadīth guarantees are enforced with top-up logic so the card is never partially empty.

---

## 3. Authentic sources referenced

HikmahGuide's religious content is anchored to recognised, authentic sources.

### 3.1 Qur'an
- **AlQuran Cloud API** — `https://api.alquran.cloud/v1`
  - Arabic edition: `quran-uthmani`
  - English edition: `en.sahih` (Sahih International translation)
  - Every displayed verse is fetched live from this API by surah:ayah, so the Arabic text and translation are authoritative rather than model-generated.

### 3.2 Ḥadīth
The curated ḥadīth in [src/lib/hadithLibrary.ts](src/lib/hadithLibrary.ts) are drawn from the major authentic collections, cited with the widely used **sunnah.com** reference numbers:
- **Ṣaḥīḥ al-Bukhārī**
- **Ṣaḥīḥ Muslim**
- **Sunan al-Tirmidhī**
- **Sunan Abī Dāwūd**
- **Sunan Ibn Mājah**
- **Sunan an-Nasā'ī**
- **Musnad Aḥmad**

### 3.3 Supplications (Duʿāʾ)
The supplications in [src/lib/duaLibrary.ts](src/lib/duaLibrary.ts) are taken from **_Hisnul Muslim_ (Fortress of the Muslim)** by Saʿīd bin ʿAlī bin Wahf al-Qaḥṭānī, with each duʿāʾ paired with its original source (a verse of the Qur'an or a ḥadīth from Bukhārī, Muslim, Abū Dāwūd, al-Tirmidhī, or Ibn Mājah).

> **Verification note:** The ḥadīth and duʿāʾ text and citations were compiled by hand and should be spot-checked against a printed _Hisnul Muslim_ or sunnah.com before public release. Qur'an verses are verified automatically at runtime against the AlQuran Cloud API.

---

## 4. Libraries and tools used

### 4.1 Runtime dependencies
| Library | Role |
|---|---|
| **react** / **react-dom** | UI framework |
| **groq-sdk** | Client for the Groq LLM API (model `llama-3.3-70b-versatile`) |
| **axios** | HTTP client used to fetch and verify Qur'an verses |
| **lucide-react** | Icon set used in the interface |

### 4.2 Build / dev tooling
| Tool | Role |
|---|---|
| **vite** | Dev server and production bundler |
| **typescript** | Type checking (`tsc`) and language |
| **@vercel/node** | Types for the serverless guidance function |

### 4.3 Browser / platform APIs
| API | Role |
|---|---|
| **Web Crypto API** (`crypto.subtle`) | Real SHA-256 hashing for the proof section |
| **AlQuran Cloud API** | Live Qur'an verse verification |

### 4.4 Project's own libraries
| File | Role |
|---|---|
| [src/lib/hikmahGuide.ts](src/lib/hikmahGuide.ts) | Orchestrates a response: calls the model, verifies verses, selects ḥadīth and duʿāʾ |
| [src/lib/islamicApi.ts](src/lib/islamicApi.ts) | Thin wrapper over the AlQuran Cloud (and hadith) APIs |
| [src/lib/hadithLibrary.ts](src/lib/hadithLibrary.ts) | Curated, theme-keyed authentic ḥadīth with citations |
| [src/lib/duaLibrary.ts](src/lib/duaLibrary.ts) | Curated, theme-keyed _Hisnul Muslim_ supplications with citations |
| [api/guidance.ts](api/guidance.ts) | Serverless function; the only place the LLM is called |

---

## 5. Disclaimer

HikmahGuide is a tool for reflection and educational support. It does not issue fatwas, does not predict the future, and is not a substitute for qualified Islamic scholarship on legal or religious rulings. For binding rulings, consult a knowledgeable scholar.
