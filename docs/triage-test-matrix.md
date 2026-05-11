# TriageMaster Rule Test Matrix

Purpose: quick manual verification cases for each rule. Fill inputs in the UI, run inference, and compare the expected outcome.

Legend:
- Victim type: Adult / Pediatric
- Expected category: RED / YELLOW / GREEN / BLACK
- Expected action/reason: key phrase that should appear in reasoning or recommendations

## START Adult Triage Rules (1-12)

1. Walking Victim Rule
- Inputs: Adult; can walk = yes; walked to wrong area = no
- Expected: GREEN
- Expected action/reason: "move to safe designated area"

2. Walking but Wrong Area Rule
- Inputs: Adult; can walk = yes; walked to wrong area/confused = yes
- Expected: YELLOW
- Expected action/reason: "perform further assessment"

3. Re-triage for Green Victim Rule
- Inputs: Adult; can walk = yes; wrong area = no; condition changed = yes
- Expected: GREEN with Rule 3 fired
- Expected action/reason: "restart triage assessment from breathing status"

4. Not Breathing Initial Rule
- Inputs: Adult; can walk = no; breathing = no
- Expected: no final category yet (Rule 4 fired)
- Expected action/reason: "open or reposition the airway"

5. Breathing After Airway Rule
- Inputs: Adult; breathing = no; breathes after airway = yes
- Expected: RED
- Expected action/reason: "immediate treatment required"

6. Not Breathing After Airway Rule
- Inputs: Adult; breathing = no; breathes after airway = no
- Expected: BLACK (terminal)
- Expected action/reason: "do not prioritize resuscitation"

7. Adult High Respiratory Rate Rule
- Inputs: Adult; breathing = yes; respiratory rate = 34
- Expected: RED
- Expected action/reason: "RR > 30"

8. Adult Normal Respiratory Rate Rule
- Inputs: Adult; breathing = yes; respiratory rate = 20
- Expected: no final category yet (Rule 8 fired)
- Expected action/reason: "continue to perfusion"

9. Poor Perfusion Rule
- Inputs: Adult; breathing = yes; RR <= 30; radial pulse absent OR cap refill > 2s
- Expected: RED
- Expected action/reason: "circulation support / bleeding control"

10. Good Perfusion Rule
- Inputs: Adult; breathing = yes; RR <= 30; radial pulse present; cap refill <= 2s
- Expected: no final category yet (Rule 10 fired)
- Expected action/reason: "continue to mental status"

11. Cannot Follow Commands Rule
- Inputs: Adult; breathing = yes; RR <= 30; perfusion adequate; follows commands = no
- Expected: RED
- Expected action/reason: "cannot follow simple commands"

12. Can Follow Commands Rule
- Inputs: Adult; breathing = yes; RR <= 30; perfusion adequate; follows commands = yes
- Expected: YELLOW
- Expected action/reason: "delayed treatment"

## Injury and Medical Emergency Rules (13-21)

13. Severe Bleeding Rule
- Inputs: severe bleeding = yes
- Expected: RED
- Expected action/reason: "direct pressure or tourniquet"

14. Open Fracture Rule
- Inputs: open fracture = yes; no red symptoms
- Expected: YELLOW
- Expected action/reason: "cover wound and splint"

15. Burn Injury Rule
- Inputs: burns = yes; airway involvement = yes
- Expected: RED
- Expected action/reason: "airway/breathing involvement"

15b. Burn Injury (serious, stable)
- Inputs: burns = yes; airway involvement = no
- Expected: YELLOW
- Expected action/reason: "cool burn, cover, monitor"

16. Heat Stroke Rule
- Inputs: heat stroke = yes
- Expected: RED
- Expected action/reason: "immediate cooling"

17. Heat Exhaustion Rule
- Inputs: heat exhaustion = yes; conscious = yes; breathing = yes
- Expected: YELLOW
- Expected action/reason: "rest, cooling, monitoring"

18. Stroke FAST Rule
- Inputs: stroke FAST signs = yes
- Expected: RED
- Expected action/reason: "urgent transport"

19. Heart Attack Rule
- Inputs: chest pain radiating = yes
- Expected: RED
- Expected action/reason: "urgent medical attention"

20. Seizure Rule
- Inputs: active seizure = yes
- Expected: RED
- Expected action/reason: "protect victim from surrounding hazards"

21. Anaphylaxis Rule
- Inputs: anaphylaxis = yes
- Expected: RED
- Expected action/reason: "urgent medical attention"

## Pediatric JumpSTART Rules (22-27)

22. Pediatric Breathing Rate Rule
- Inputs: Pediatric; breathing = yes; RR < 15 OR RR > 45
- Expected: RED
- Expected action/reason: "RR outside 15-45"

23. Pediatric Normal Breathing Rule
- Inputs: Pediatric; breathing = yes; RR 15-45
- Expected: no final category yet (Rule 23 fired)
- Expected action/reason: "continue to circulation/AVPU"

24. Pediatric Apnea Assessment Rule
- Inputs: Pediatric; breathing = no; pulse = yes
- Expected: no final category yet (Rule 24 fired)
- Expected action/reason: "give 5 rescue breaths"

25. Pediatric Starts Breathing After Rescue Breaths Rule
- Inputs: Pediatric; breathing = no; pulse = yes; breathes after rescue = yes
- Expected: RED
- Expected action/reason: "resumed breathing after 5 rescue breaths"

26. Pediatric Still Not Breathing Rule
- Inputs: Pediatric; breathing = no; pulse = yes; breathes after rescue = no
- Expected: BLACK (terminal)
- Expected action/reason: "still not breathing after rescue breaths"

27. Pediatric AVPU Rule
- Inputs: Pediatric; breathing = yes; RR 15-45; AVPU = Voice or Pain or Unresponsive
- Expected: RED
- Expected action/reason: "AVPU = Voice/Pain/Unresponsive"

## Conflict Resolution and Re-evaluation (28-29)

28. Conflict Resolution Rule
- Inputs: can walk = yes (Green) AND severe bleeding = yes (Red)
- Expected: RED (highest severity wins)
- Expected action/reason: "Rule 28 applied" note

29. Re-triage Rule
- Inputs: condition changed = yes
- Expected: Rule 29 fired
- Expected action/reason: "re-run the full triage process"

## Ethical and Safety Rules (30-32)

30. Consent Rule
- Inputs: conscious = yes; refuses treatment = yes
- Expected: no category change; action warning
- Expected action/reason: "do not perform physical treatment" + refusal recorded

31. Implied Consent Rule
- Inputs: conscious = no
- Expected: no category change; action guidance
- Expected action/reason: "assume implied consent"

32. Scene Safety Rule
- Inputs: scene safe = no
- Expected: control STOP; assessment paused
- Expected action/reason: "do not enter the danger area"

## Reporting Rule (33)

33. METHANE Reporting Rule
- Inputs: MCI confirmed = yes
- Expected: METHANE action appears in recommendations
- Expected action/reason: "prepare METHANE report"
