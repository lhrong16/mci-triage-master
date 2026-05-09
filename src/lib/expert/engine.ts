import { RULES, type TriageColor } from "./rules";

export type AVPU = "Alert" | "Voice" | "Pain" | "Unresponsive";

export interface Symptoms {
  victimType: "Adult" | "Pediatric";
  sceneSafe: boolean;
  conscious: boolean;
  refusesTreatment: boolean;
  canWalk: boolean;
  walkedToWrongArea: boolean;
  breathing: boolean;
  breathesAfterAirway: boolean;
  pediatricBreathesAfterRescue: boolean;
  hasPulse: boolean;
  respiratoryRate: number;
  radialPulsePresent: boolean;
  capRefillSeconds: number;
  capRefillUncertain: boolean;
  followsCommands: boolean;
  avpu: AVPU;
  severeBleeding: boolean;
  openFracture: boolean;
  burns: boolean;
  burnAirwayInvolvement: boolean;
  heatStroke: boolean;
  heatExhaustion: boolean;
  strokeFAST: boolean;
  chestPainRadiates: boolean;
  activeSeizure: boolean;
  anaphylaxis: boolean;
  isMCI: boolean;
}

export const defaultSymptoms = (): Symptoms => ({
  victimType: "Adult",
  sceneSafe: true,
  conscious: true,
  refusesTreatment: false,
  canWalk: false,
  walkedToWrongArea: false,
  breathing: true,
  breathesAfterAirway: false,
  pediatricBreathesAfterRescue: false,
  hasPulse: true,
  respiratoryRate: 18,
  radialPulsePresent: true,
  capRefillSeconds: 2,
  capRefillUncertain: false,
  followsCommands: true,
  avpu: "Alert",
  severeBleeding: false,
  openFracture: false,
  burns: false,
  burnAirwayInvolvement: false,
  heatStroke: false,
  heatExhaustion: false,
  strokeFAST: false,
  chestPainRadiates: false,
  activeSeizure: false,
  anaphylaxis: false,
  isMCI: false,
});

export interface FiredRule {
  id: number;
  title: string;
  reason: string;
  classification: TriageColor;
  recommendation: string;
}

export interface InferenceResult {
  classification: Exclude<TriageColor, null>;
  fired: FiredRule[];
  reasoning: string[];
  recommendations: string[];
  severityScore: number; // 0-100
  notes: string[];
  control?: "STOP_SCENE_UNSAFE" | "LIMIT_TO_NON_CONTACT_ASSESSMENT";
}

const SEVERITY: Record<Exclude<TriageColor, null>, number> = {
  RED: 4, YELLOW: 3, GREEN: 2, BLACK: 1,
};

function pickMostSevere(colors: (TriageColor)[]): Exclude<TriageColor, null> {
  const valid = colors.filter(Boolean) as Exclude<TriageColor, null>[];
  if (valid.length === 0) return "GREEN";
  // Black wins only if it appears (per Rule 6 / 26 — already triggered intentionally)
  if (valid.includes("BLACK") && !valid.includes("RED")) return "BLACK";
  return valid.sort((a, b) => SEVERITY[b] - SEVERITY[a])[0];
}

export function runInference(s: Symptoms): InferenceResult {
  const fired: FiredRule[] = [];
  const reasoning: string[] = [];
  const supplementalRecommendations: string[] = [];
  const notes: string[] = [];
  const classifications: TriageColor[] = [];

  const fire = (id: number, reason: string, classification: TriageColor, recommendation: string) => {
    const r = RULES.find(x => x.id === id)!;
    fired.push({ id, title: r.title, reason, classification, recommendation });
    reasoning.push(`Rule ${id} (${r.title}) → ${reason}`);
    if (classification) classifications.push(classification);
  };

  let control: InferenceResult["control"];

  const makeResult = (): InferenceResult => {
    const classification = pickMostSevere(classifications);
    if (classifications.filter(Boolean).length > 1) {
      notes.push(`Rule 28 applied — multiple categories matched, selected ${classification}.`);
    }
    const score =
      classification === "RED" ? 95 :
      classification === "BLACK" ? 80 :
      classification === "YELLOW" ? 55 : 20;
    // Keep recommendations tied to final color, and also keep neutral actions
    // (e.g., consent/safety/process rules such as Rule 30 refusal recording).
    const finalRecommendations = Array.from(new Set(
      [
        ...fired
          .filter(f => f.classification === classification || f.classification === null)
          .map(f => f.recommendation)
          .filter(Boolean),
        ...supplementalRecommendations,
      ]
    ));
    return { classification, fired, reasoning, recommendations: finalRecommendations, severityScore: score, notes, control };
  };

  // R32 Scene safety — if unsafe, short-circuit and return control signal
  if (!s.sceneSafe) {
    fire(32, "Environment reported as unsafe.", null,
      "Do not enter the danger area. Wait for safety support / emergency services.");
    notes.push("⚠ Scene unsafe — withhold approach.");
    control = "STOP_SCENE_UNSAFE";
    // Allow METHANE to be prepared without physical assessment
    if (s.isMCI) fire(33, "Mass casualty incident confirmed.", null, "Prepare METHANE report for command.");
    return makeResult();
  }

  // R30/R31 Consent
  if (s.conscious && s.refusesTreatment) {
    fire(30, "Conscious victim refuses treatment.", null,
      "Do not perform physical treatment. Record refusal if possible.");
    notes.push("ℹ Victim refusal recorded.");
  } else if (!s.conscious) {
    fire(31, "Victim unconscious — implied consent applies.", null,
      "Continue assessment within responder's training.");
  }

  // R1/R2 walking — specific (wrong area) first, mutually exclusive
  if (s.canWalk) {
    if (s.walkedToWrongArea) {
      fire(2, "Walking but disoriented / wrong area.", "YELLOW",
        "Perform further assessment.");
    } else {
      fire(1, "Victim can walk.", "GREEN",
        "Direct victim to designated safe area.");
    }
  }

  // Breathing path (when not walking, or to handle worsened state regardless)
  if (!s.breathing) {
    fire(4, "Victim is not breathing — open/reposition airway.", null,
      "Open or reposition the airway.");

    if (s.victimType === "Adult") {
      if (s.breathesAfterAirway) {
        fire(5, "Adult resumed breathing after airway repositioning.", "RED",
          "Immediate treatment required.");
      } else {
        fire(6, "Adult still not breathing after airway repositioning.", "BLACK",
          "Do not prioritize resuscitation during MCI triage.");
      }
    } else {
      // Pediatric
      if (s.hasPulse) {
        fire(24, "Child not breathing but has pulse — give 5 rescue breaths.", null,
          "Administer 5 rescue breaths.");
        if (s.pediatricBreathesAfterRescue) {
          fire(25, "Child resumed breathing after 5 rescue breaths.", "RED",
            "Immediate treatment required.");
        } else {
          fire(26, "Child still not breathing after rescue breaths.", "BLACK",
            "Do not prioritize resuscitation during MCI triage.");
        }
      } else {
        fire(26, "Child not breathing and no pulse.", "BLACK",
          "Do not prioritize resuscitation during MCI triage.");
      }
    }
  } else {
    // Breathing — assess respiratory rate
    if (s.victimType === "Adult") {
      if (s.respiratoryRate > 30) {
        fire(7, `Adult RR ${s.respiratoryRate} > 30/min.`, "RED",
          "Immediate treatment required.");
      } else {
        fire(8, `Adult RR ${s.respiratoryRate} ≤ 30/min — continue to perfusion.`, null, "");
        // Perfusion
        const capRefillDelayed = !s.capRefillUncertain && s.capRefillSeconds > 2;
        const capRefillText = s.capRefillUncertain ? "unknown" : `${s.capRefillSeconds}s`;
        if (s.capRefillUncertain) {
          notes.push("ℹ Capillary refill marked as uncertain; perfusion judged using radial pulse.");
          supplementalRecommendations.push("If possible, reassess capillary refill when conditions allow.");
        }
        if (!s.radialPulsePresent || capRefillDelayed) {
          fire(9, `Poor perfusion (radial pulse ${s.radialPulsePresent ? "present" : "absent"}, cap refill ${capRefillText}).`,
            "RED", "Provide circulation support / bleeding control.");
        } else {
          fire(10, `Adequate perfusion (radial pulse present, cap refill ${capRefillText}) — continue to mental status.`, null, "");
          if (!s.followsCommands) {
            fire(11, "Cannot follow simple commands.", "RED",
              "Immediate monitoring and treatment.");
          } else {
            fire(12, "Follows commands, breathing & perfusion stable.", "YELLOW",
              "Delayed treatment.");
          }
        }
      }
    } else {
      // Pediatric breathing
      if (s.respiratoryRate < 15 || s.respiratoryRate > 45) {
        fire(22, `Pediatric RR ${s.respiratoryRate} outside 15–45/min.`, "RED",
          "Immediate treatment required.");
      } else {
        fire(23, `Pediatric RR ${s.respiratoryRate} within 15–45 — continue to circulation/AVPU.`, null, "");
        const poorPerfusionPeds = !s.radialPulsePresent || (!s.capRefillUncertain && s.capRefillSeconds > 2);
        if (poorPerfusionPeds) {
          fire(9, `Poor perfusion in child (radial pulse ${s.radialPulsePresent ? "present" : "absent"}, cap refill ${s.capRefillUncertain ? "unknown" : `${s.capRefillSeconds}s`}).`, "RED",
            "Provide circulation support / bleeding control.");
        }
        if (s.capRefillUncertain) {
          notes.push("ℹ Pediatric capillary refill marked as uncertain; prioritize pulse and mental status cues.");
          supplementalRecommendations.push("If possible, reassess capillary refill when conditions allow.");
        }
        if (s.avpu === "Unresponsive" || s.avpu === "Pain") {
          fire(27, `Pediatric AVPU = ${s.avpu}.`, "RED",
            "Immediate treatment required.");
        }
      }
    }
  }

  // Trauma & medical (independent rules)
  if (s.severeBleeding)
    fire(13, "Severe bleeding present.", "RED",
      "Apply direct pressure or tourniquet if appropriate and trained.");
  if (s.openFracture)
    fire(14, "Open fracture / visible bone.", "YELLOW",
      "Cover wound and splint injured area.");
  if (s.burns) {
    if (s.burnAirwayInvolvement)
      fire(15, "Burns with airway involvement / breathing difficulty.", "RED",
        "Immediate airway management.");
    else
      fire(15, "Serious burns, breathing stable.", "YELLOW",
        "Cool burn, cover, monitor.");
  }
  if (s.heatStroke)
    fire(16, "Heat stroke — high body temp + altered mental status.", "RED",
      "Immediate cooling.");
  if (s.heatExhaustion && !s.heatStroke)
    fire(17, "Heat exhaustion — conscious, breathing normally.", "YELLOW",
      "Rest, cooling, monitoring.");
  if (s.strokeFAST)
    fire(18, "Stroke FAST signs (Face/Arm/Speech).", "RED",
      "Urgent transport and medical attention.");
  if (s.chestPainRadiates)
    fire(19, "Chest pain radiating to arm/jaw/back/shoulder.", "RED",
      "Urgent medical attention — possible MI.");
  if (s.activeSeizure)
    fire(20, "Active seizure activity.", "RED",
      "Protect victim from surrounding hazards.");
  if (s.anaphylaxis)
    fire(21, "Anaphylaxis — severe allergic reaction with airway/swelling.", "RED",
      "Urgent medical attention; epinephrine if available.");

  // R33 METHANE (non-control path)
  if (s.isMCI) {
    fire(33, "Mass casualty incident confirmed.", null,
      "Prepare METHANE report for command.");
  }

  return makeResult();
}