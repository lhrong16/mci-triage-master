# MCI Triage

A small, local-first rule-based triage helper for mass-casualty incidents.

# Overview

This app guides a responder through a brief triage workflow and produces immediate recommendations using a canonical rule set. It’s designed to be fast, transparent, and easy to modify.

# Features

- Rule-driven inference engine: `src/lib/expert/engine.ts`
- Canonical rules: `src/lib/expert/rules.ts`
- Multi-step triage UI: `src/routes/triage.tsx`
- Results and recommendations: `src/routes/results.tsx`
- Local persistence: `src/lib/store.ts`

# Prerequisites

- Node.js 18+ and npm (or yarn)
- Recommended editor: VS Code

# Quick start

Install dependencies:
```bash
npm install
```

Run dev server:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Preview:
```bash
npm run preview
```

# Project structure (high level)

- `src/lib/expert/engine.ts` — inference logic  
- `src/lib/expert/rules.ts` — rule list and text  
- `src/routes/triage.tsx` — assessment UI  
- `src/routes/results.tsx` — results + recommendations  
- `src/lib/store.ts` — local persistence helpers

# Development notes

- The engine emits `FiredRule` entries; `makeResult()` composes classification and recommendations.  
- Neutral/process rules (e.g., record refusal) are included in final recommendations.  
- Control signals (scene unsafe, treatment refused) map to paused/limited assessments.

# Recommended Git workflow

Normal push:
```bash
git add -A
git commit -m "Describe change"
git push origin main
```

Overwrite remote history (coordinate with collaborators; safer option):
```bash
git fetch origin
git push --force-with-lease origin main
```

Force regardless (dangerous):
```bash
git push --force origin main
```

# Contributing

- Open focused PRs against `main`.  
- Keep changes small and add tests when altering inference logic.

# License

Add a `LICENSE` file (e.g., MIT) or update this section with your preferred license.

---

If you want a shorter README or a translation (e.g., Spanish), tell me which sections to keep or translate and I’ll provide it.
