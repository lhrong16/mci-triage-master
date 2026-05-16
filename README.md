# TriageMaster

TriageMaster is a local-first rule-based expert system for Knowledge Representation and Reasoning coursework. It supports beginner or non-expert first responders during mass casualty incidents by guiding them through START adult triage, JumpSTART pediatric triage, re-triage, scene safety, consent constraints, and METHANE reporting.

## Purpose

The system reduces decision-making time during high-pressure incidents and makes each recommendation explainable. Every result shows the final triage tag, matched rules, severity score, notes, and immediate recommended actions. It is intended for educational and emergency assistance purposes only and does not replace professional medical judgment, emergency medical services, or local protocols.

## Triage Categories

- Red, Immediate: life-threatening or unstable conditions requiring urgent treatment.
- Yellow, Delayed: serious injury or illness but stable enough to wait.
- Green, Minor: walking wounded who can move to a designated safe area.
- Black, Deceased or Expectant: no breathing after the required adult airway intervention or pediatric rescue-breath step.

## Knowledge Sources

The knowledge base combines literature review, START triage, JumpSTART pediatric triage, METHANE reporting, consent and safety principles, and human expert validation from a St John Ambulance Malaysia perspective.

Reviewed systems include SETRIAGE, ESTriage, e-Triage, and fuzzy triage approaches. TriageMaster uses rule-based reasoning because the rules are transparent, explainable, and easier to validate with a human expert than opaque scoring models.

## Functional Requirements

- Guide users through simple Yes/No toggles, radio selections, and sliders.
- Classify victims into Red, Yellow, Green, or Black.
- Support adult START and pediatric JumpSTART logic.
- Support re-triage when breathing, circulation, or mental status changes.
- Show clear recommendations and the fired rule trace.
- Save local incident records and METHANE reports.
- Allow deleting each triage record or METHANE report.
- Export records as text and open a printable PDF view.
- Work on mobile-friendly screens for field use.

## Non-Functional Requirements

- Simple and fast enough for non-expert users.
- Clear labels without unnecessary medical jargon.
- Local-first persistence using browser local storage.
- Transparent rule output for explainability.
- Consistent results based on the validated rule base.

## Implemented Rule Groups

- START Adult Triage Rules: Rules 1-12
- Injury and Medical Emergency Rules: Rules 13-21
- Pediatric JumpSTART Rules: Rules 22-27
- Conflict Resolution and Re-evaluation Rules: Rules 28-29
- Ethical and Safety Rules: Rules 30-32
- Reporting Rule: Rule 33
- Black Tag Multiple Casualty Priority Rule: Rule 34

## Rule Base

Rule 1: Walking Victim Rule  
IF the victim can walk, THEN classify the victim as Green and instruct the victim to move to a safe designated area.

Rule 2: Walking but Wrong Area Rule  
IF the victim can walk but appears confused or unable to follow directions, THEN classify the victim as Yellow and perform further assessment.

Rule 3: Re-triage for Green Victim Rule  
IF the victim was classified as Green but their condition becomes worse, THEN restart triage from breathing status.

Rule 4: Not Breathing Initial Rule  
IF the victim is not breathing, THEN instruct the responder to open or reposition the airway.

Rule 5: Breathing After Airway Rule  
IF the adult victim was not breathing but starts breathing after airway repositioning within 5 seconds, THEN classify the victim as Red.

Rule 6: Not Breathing After Airway Rule  
IF the adult victim is still not breathing after airway repositioning, THEN classify the victim as Black.

Rule 7: Adult High Respiratory Rate Rule  
IF the victim is an adult and respiratory rate is more than 30 breaths per minute, THEN classify the victim as Red.

Rule 8: Adult Normal Respiratory Rate Rule  
IF the victim is an adult and respiratory rate is 30 breaths per minute or below, THEN continue to perfusion.

Rule 9: Poor Perfusion Rule  
IF radial pulse is absent OR capillary refill is more than 2 seconds, THEN classify the victim as Red.

Rule 10: Good Perfusion Rule  
IF radial pulse is present AND capillary refill is 2 seconds or below, THEN continue to mental status.

Rule 11: Cannot Follow Commands Rule  
IF the victim cannot follow simple commands, THEN classify the victim as Red.

Rule 12: Can Follow Commands Rule  
IF the victim cannot walk, can follow simple commands, breathing is stable, and perfusion is adequate, THEN classify the victim as Yellow.

Rule 13: Severe Bleeding Rule  
IF severe bleeding is present, THEN classify as Red and recommend direct pressure or tourniquet if trained.

Rule 14: Open Fracture Rule  
IF bone is visible or open fracture is suspected, THEN treat as serious, cover and splint. If no Red symptoms are present, classify as Yellow.

Rule 15: Burn Injury Rule  
IF burns involve breathing difficulty or airway involvement, THEN classify as Red. If serious burns are present but breathing is stable, classify as Yellow.

Rule 16: Heat Stroke Rule  
IF high body temperature is present with confusion, altered mental status, or collapse, THEN classify as Red and recommend cooling.

Rule 17: Heat Exhaustion Rule  
IF dehydration, tiredness, dizziness, or weakness is present and the victim is conscious and breathing normally, THEN classify as Yellow.

Rule 18: Stroke FAST Rule  
IF face drooping, arm weakness, or speech difficulty is present, THEN classify as Red.

Rule 19: Heart Attack Rule  
IF chest pain radiates to arm, jaw, back, or shoulder, THEN classify as Red.

Rule 20: Seizure Rule  
IF active seizure or uncontrolled body movement is present, THEN classify as Red and protect from hazards.

Rule 21: Anaphylaxis Rule  
IF severe allergic reaction is present with breathing difficulty, swelling, or collapse, THEN classify as Red.

Rule 22: Pediatric Breathing Rate Rule  
IF child respiratory rate is less than 15 or more than 45 breaths per minute, THEN classify as Red.

Rule 23: Pediatric Normal Breathing Rule  
IF child respiratory rate is between 15 and 45, THEN continue to circulation and AVPU.

Rule 24: Pediatric Apnea Assessment Rule  
IF the child is not breathing, THEN check pulse. If pulse is present, give 5 rescue breaths and reassess. If pulse is absent, classify as Black.

Rule 25: Pediatric Starts Breathing After Rescue Breaths Rule  
IF the child starts breathing after 5 rescue breaths, THEN classify as Red.

Rule 26: Pediatric Still Not Breathing Rule  
IF the child remains not breathing after rescue breaths, THEN classify as Black.

Rule 27: Pediatric AVPU Rule  
IF child AVPU is Unresponsive, or the child shows an inappropriate response to Voice or Pain, THEN classify as Red.

Rule 28: Conflict Resolution Rule  
IF more than one triage category is satisfied, THEN select the most serious valid category. Black is assigned only when confirmed by Rule 6 or Rule 26. If Black is not triggered, conflict resolution uses Red > Yellow > Green.

Rule 29: Re-triage Rule  
IF a previously classified victim has breathing, circulation, or mental status changes, THEN re-run the full triage process and compare against the previous local record.

Rule 30: Consent Rule  
IF the victim is conscious and refuses touch or treatment, THEN do not perform physical treatment and record refusal if possible.

Rule 31: Implied Consent Rule  
IF the victim is unconscious or unable to respond, THEN assume implied consent for emergency assessment and care within the responder's training level.

Rule 32: Scene Safety Rule  
IF the environment is unsafe, THEN do not enter and wait for safety support or emergency services.

Rule 33: METHANE Reporting Rule  
IF a mass casualty incident is confirmed, THEN prepare METHANE: Major incident, Exact location, Type, Hazards, Access, Number/type/severity of casualties, Emergency services.

Rule 34: Black Tag Multiple Casualty Priority Rule  
IF the victim meets Black tag criteria and other patients or casualties still need to be assessed, THEN classify the victim as Black, record the finding if possible, and continue assessing other patients. ELSE IF the victim meets Black tag criteria and no other patients or casualties are waiting to be assessed, THEN classify the victim as Black and follow local emergency protocol or responder instructions.

## Quick Start

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Main Files

- `src/lib/expert/engine.ts`: inference engine.
- `src/lib/expert/rules.ts`: canonical rule text.
- `src/routes/triage.tsx`: five-step assessment wizard.
- `src/routes/results.tsx`: classification, matched rules, and actions.
- `src/routes/admin.tsx`: local records, delete, export, and printable PDF views.
- `src/routes/methane.tsx`: METHANE report form.
- `src/lib/store.ts`: local storage helpers.
