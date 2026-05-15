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
