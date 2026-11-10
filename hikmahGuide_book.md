# HikmahGuide: The Book

_How HikmahGuide works, how it keeps its answers tied to authentic sources, and how conversations are kept._

HikmahGuide is a calm, dark themed web companion for reflective Islamic guidance. You ask in plain language, and it answers with a warm reflection, two verses of the Qurʾān, two ḥadīth, practical steps and a duʿāʾ, each with its reference. The conversation carries on from question to question and is saved on your device, so you can return to it.

This document explains how each part is made, and where the material comes from.

---

## 1. What an answer contains

| Section | Contents |
|---|---|
| **Opening** | One or two warm sentences that acknowledge your situation |
| **Main guidance** | A reflection of about 130 to 200 words, with citation chips such as [Q1] and [H2] |
| **How it was made** | A badge: written from the sources, or compiled directly from them |
| **Key reflections** | Three or four short insights |
| **Qurʾānic guidance** | Two distinct verses, fetched live, with a verification badge and a link to Quran.com |
| **Authentic ḥadīth** | Two distinct narrations from the curated library, with reference, grade and a link to Sunnah.com |
| **Practical steps** | Four or five concrete steps |
| **Suggested duʿāʾ** | A supplication from _Hisnul Muslim_ with its source |
| **Notes** | A care message if someone may be in danger, and a note to ask a scholar if a ruling was requested |
| **Follow up questions** | Suggestions that continue the conversation |
| **Proof / Hash** | `SHA-256(question + timestamp)`, reproducible from the two values shown |

---

## 2. The core idea: sources first, the model second

Language models are fluent, and fluency is exactly the danger. They will happily produce a lovely ḥadīth with a wrong or invented reference. For religious content that is not acceptable, so HikmahGuide is built around one rule:

> **The model may only write about scripture that was retrieved for it, and everything it writes is checked.**

The work is split like this:

1. **The model understands.** It reads your question (and the recent chat) and picks one to three theme keys from a fixed list, such as anxiety, patience or family. It also flags questions that are out of scope, that ask for a ruling, or that suggest someone may be in danger.
2. **The code retrieves.** Verses are chosen from a Qurʾān topic index and fetched live. Ḥadīth and duʿāʾ are chosen from curated libraries. Anything already shown in this chat is skipped, so a follow up brings new material.
3. **The model writes.** It receives the retrieved texts as numbered sources and writes a reflection around them. It must tag every religious statement, and it is told not to mention any other verse, ḥadīth, scholar or story.
4. **The code checks.** The guard goes through every sentence (see section 4).
5. **The page shows it all.** Citation chips in the text jump to the matching source card, and each card links to the original.

### Architecture

```
Question + recent chat
        │
        ▼
  src/App.tsx ───────────────► /api/guidance  (server/handler.ts)
                                      │
                                      ▼
                             server/service.ts
        ┌───────────────┬─────────────┼───────────────┬──────────────────┐
        ▼               ▼             ▼               ▼                  ▼
   classify        Qurʾān index   ḥadīth + duʿāʾ    write (model)     guard
   (model +        + live fetch   libraries         from sources      checks every
    lexicon)       AlQuran Cloud  + grades          only              sentence
```

---

## 3. Authentic sources

### 3.1 Qurʾān

- Source: [AlQuran Cloud](https://alquran.cloud). Arabic from `quran-uthmani`, English from `en.sahih` (Saheeh International).
- The app stores only references (surah and ayah), never verse text. The text is fetched when the answer is made.
- Each reply is checked: the verse number, the surah number and the edition must be exactly what was asked for, or it is discarded.
- The service allows 12 requests a second. Each verse is one request, results are cached, and rate limit replies are retried after a short pause.
- If verification is not possible, the app shows fewer verses and says so. It never falls back to unchecked text.

Each verse is shown on its own, so the index leaves out verses that only make sense next to their neighbours. For example it does not use a verse that opens with a ruling about fighting, or one that begins with an exception clause, even when a phrase inside it is often quoted.

### 3.2 Ḥadīth

The curated ḥadīth come from the major collections, cited with sunnah.com style numbers: Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan al-Tirmidhī, Sunan Abī Dāwūd, Sunan an-Nasā’ī, Sunan Ibn Mājah and Musnad Aḥmad.

They were checked against the open [hadith-api](https://github.com/fawazahmed0/hadith-api) dataset, and that check found real problems:

- One citation pointed at a different narration, so it was removed.
- Two narrations were graded weak (one "very weak"), so they were removed.
- A duʿāʾ was cited to the wrong collection for its exact wording, so the citation was corrected.

**Inclusion rule.** A narration is dropped if al-Albānī grades it weak, or if two or more graders in the dataset do. Where a single stricter grader dissents from the rest, the narration stays, and the label names whose grading is shown. Narrations in Ṣaḥīḥ al-Bukhārī and Ṣaḥīḥ Muslim are labelled as coming from a Ṣaḥīḥ collection.

Two Musnad Aḥmad narrations (2803 and 8952) are not in the open dataset. They show no grade and no link, and should be checked by hand.

### 3.3 Duʿāʾ

Supplications come from _Hisnul Muslim_ (Fortress of the Muslim) by Saʿīd bin ʿAlī bin Wahf al-Qaḥṭānī. Each is paired with the narration or verse it comes from, and the audit checks that the cited source really contains that supplication.

### 3.4 The audit

`npm run audit:sources` repeats these checks live whenever you want:

1. Every verse in the index is fetched through the app's own client, so the live service and the client stay in agreement.
2. Every ḥadīth citation must point at a narration with the same content, and the grade table must match the dataset.
3. Every duʿāʾ must match what it cites.

---

## 4. The guard

Whatever the model writes goes through `server/guard.ts`. A sentence is removed when it:

- cites a ḥadīth collection, a ḥadīth number, or a verse number of its own,
- says that Allah, the Prophet ﷺ, a companion or the Qurʾān said or taught something, without a tag for a numbered source,
- puts words in quotation marks that cannot be found in the retrieved sources,
- uses a tag for a source that does not exist (the tag is removed, and the claim goes with it).

It also strips markdown, HTML and links. If too little of the model's reflection survives, the main guidance is compiled directly from the sources, and the badge on the card changes to say so. The guard is covered by tests, and those tests were checked by turning the guard off and watching them fail.

Prompt injection is handled in layers. The model's output is untrusted, scripture is never taken from it, and the guard removes unsourced claims, so a message like "ignore your rules" cannot make the app display invented scripture.

---

## 5. Conversations that continue and come back

- The chat is a thread. Each question and answer is added below the last, and the recent turns go with each question so follow ups make sense.
- Every chat is saved in the browser's local storage, along with its answers. On return, the last open chat is restored.
- The sidebar lists chats by day, with search (it also searches what you asked), rename and delete, and a clear all button. On phones it is a drawer.
- A chat gets a short title from its first answer, which you can change.
- If an answer never arrived, for example because the tab was closed, the chat shows a clear "try again" prompt.
- Chats stay on the device. There is no account and no chat database, so they do not follow you to another browser or phone.

How saving is kept safe:

- Everything read back is validated again. Damaged or edited records are skipped, ids must match a strict pattern, and links are rebuilt from validated numbers.
- If the browser's storage is full, the oldest chats are removed to make room. If saving still fails, a message says so, and the chat keeps working in memory.
- In private modes where storage is blocked, the app says that chats will end when the tab closes.
- Changes in one tab appear in other tabs.

---

## 6. The proof hash

Each answer has a hash you can reproduce:

```
0x<64 hex characters>
SHA-256("<your question>" + <ISO timestamp>)
```

It is computed in the browser with the Web Crypto API. Take the question and timestamp shown, run SHA-256, and you get the same digest. It is an integrity fingerprint, not an on-chain attestation.

---

## 7. Reliability

| What goes wrong | What happens |
|---|---|
| No model key, or the model is down | The answer is compiled directly from the verified sources, and says so |
| The model breaks the rules | Those sentences are removed, or the main guidance is compiled from the sources |
| The Qurʾān service is down | Fewer verses are shown, with a note, and nothing unverified is displayed |
| The browser is offline | The question stays in the chat with a "try again" button |
| Too many requests | A friendly message with how long to wait |

---

## 8. Libraries and tools

| Tool | Role |
|---|---|
| React, React DOM | The interface |
| TypeScript | Types across the browser and the server |
| Vite | Dev server and production build. In dev it also serves the API route |
| Vitest | Unit tests, and the live audit |
| groq-sdk | Client for the writing model |
| Web Crypto | The proof hash |
| AlQuran Cloud | Live verse text |
| hadith-api (dataset) | Independent check of the ḥadīth library |

---

## 9. Disclaimer

HikmahGuide is a tool for reflection and educational support. It does not issue fatwas, does not predict the future, and is not a substitute for qualified Islamic scholarship on legal or religious rulings. For binding rulings, please consult a knowledgeable scholar.
