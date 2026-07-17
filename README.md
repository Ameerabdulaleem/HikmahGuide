# HikmahGuide

HikmahGuide is a premium, dark-themed web experience designed to offer thoughtful Islamic guidance through a calm and elegant conversational interface. The app blends a modern UI with reflective content inspired by Islamic values, authentic source references, and a proof-style hash section for a distinctive, future-facing experience.

## Features
- Elegant, dark, premium single-page experience
- Guided prompts for spiritual and practical reflection
- Qur'anic and hadith-inspired source references
- Proof/hash-style response attribution
- Fallback guidance mode for reliable local use

## Tech Stack
- React + TypeScript
- Vite
- Axios
- Groq SDK
- Lucide icons

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

### 3. Build for production
```bash
npm run build
```

## Environment Variables
If you want to enable live AI generation through Groq, set the following environment variable:

```bash
VITE_GROQ_API_KEY=your_api_key_here
```

## Deployment
This project is ready to be deployed to platforms such as:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

For Vite apps, set the build command to:
```bash
npm run build
```

and the output directory to:
```bash
dist
```

## Notes
This project is intended for reflection and educational support. It should not replace qualified Islamic scholarship for legal or religious rulings.
