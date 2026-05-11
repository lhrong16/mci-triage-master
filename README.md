MCI Triage
A small, local-first rule-based triage helper for mass-casualty incidents.

Overview
This app guides a responder through a brief triage workflow and produces immediate recommendations using a canonical rule set. It’s designed to be fast, transparent, and easy to modify.

Features
Rule-driven inference engine: engine.ts
Canonical rules: rules.ts
Multi-step triage UI: triage.tsx
Results and recommendations: results.tsx
Local persistence: store.ts
Prerequisites
Node.js 18+ and npm (or yarn)
Recommended editor: VS Code
Quick start
Install dependencies:

Run dev server:

Build:

Preview:

Project structure (high level)
engine.ts — inference logic
rules.ts — rule list and text
triage.tsx — assessment UI
results.tsx — results + recommendations
store.ts — local persistence helpers
Development notes
The engine emits FiredRule entries; makeResult() composes classification and recommendations.
Neutral/process rules (e.g., record refusal) are included in final recommendations.
Control signals (scene unsafe, treatment refused) map to paused/limited assessments.
Recommended Git workflow
Normal push:

Overwrite remote history (coordinate with collaborators; safer option):

Force regardless (dangerous):

Contributing
Open focused PRs against main.
Keep changes small and add tests when altering inference logic.
License
Add a LICENSE file (e.g., MIT) or update this section with your preferred license.
