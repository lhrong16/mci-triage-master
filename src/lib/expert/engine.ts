import { RULES, type TriageColor } from "./rules";

export type AVPU = "Alert" | "Voice" | "Pain" | "Unresponsive";

export interface Symptoms {
  victimType: "Adult" | "Pediatric";
  sceneSafe: boolean;
  conscious: boolean;
  refusesTreatment: boolean;
  conditionChangedSinceLastCheck: boolean;
  canWalk: boolean;
  walkedToWrongArea: boolean;
  breathing: boolean;
  breathesAfterAirway: boolean;
  pediatricBreathesAfterRescue: boolean;
  hasPulse: boolean;
  respiratoryRate: number;
  respiratoryRateUncertain: boolean;
  radialPulsePresent: boolean;
  radialPulseUncertain: boolean;
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
  otherPatientsWaiting: boolean;
}

export const defaultSymptoms = (): Symptoms => ({
  victimType: "Adult",
  sceneSafe: true,
  conscious: true,
  refusesTreatment: false,
  conditionChangedSinceLastCheck: false,
  canWalk: false,
  walkedToWrongArea: false,
  breathing: true,
  breathesAfterAirway: false,
  pediatricBreathesAfterRescue: false,
  hasPulse: true,
  respiratoryRate: 18,
  respiratoryRateUncertain: false,
  radialPulsePresent: true,
  radialPulseUncertain: false,
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
  otherPatientsWaiting: false,
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
  severityScore: number;
  notes: string[];
  control?: "STOP_SCENE_UNSAFE" | "LIMIT_TO_NON_CONTACT_ASSESSMENT";
}

const SEVERITY: Record<Exclude<TriageColor, null>, number> = {
  BLACK: 4,
  RED: 3,
  YELLOW: 2,
  GREEN: 1,
};

function pickMostSevere(colors: TriageColor[]): Exclude<TriageColor, null> {
  const valid = Array.from(new Set(colors.filter(Boolean))) as Exclude<TriageColor, null>[];
  if (valid.length === 0) return "GREEN";
  return valid.sort((a, b) => SEVERITY[b] - SEVERITY[a])[0];
}

export function runInference(s: Symptoms): InferenceResult {
  const fired: FiredRule[] = [];
  const reasoning: string[] = [];
  const supplementalRecommendations: string[] = [];
  const notes: string[] = [];
  const classifications: TriageColor[] = [];

  const fire = (id: number, reason: string, classification: TriageColor, recommendation: string) => {
    const r = RULES.find((x) => x.id === id)!;
    fired.push({ id, title: r.title, reason, classification, recommendation });
    reasoning.push(`Rule ${id} (${r.title}) -> ${reason}`);
    if (classification) classifications.push(classification);
  };

  let control: InferenceResult["control"];

  const makeResult = (): InferenceResult => {
    const classification = pickMostSevere(classifications);
    const uniqueClassifications = new Set(classifications.filter(Boolean));
    if (uniqueClassifications.size > 1) {
      notes.push(`Rule 28 applied - multiple categories matched, selected ${classification}.`);
    }
    const score =
      classification === "BLACK" ? 100 :
      classification === "RED" ? 95 :
      classification === "YELLOW" ? 55 : 25;
    const finalRecommendations = Array.from(new Set(
      [
        ...fired
          .filter((f) => f.classification === classification || f.classification === null)
          .map((f) => f.recommendation)
          .filter(Boolean),
        ...supplementalRecommendations,
      ]
    ));
    return { classification, fired, reasoning, recommendations: finalRecommendations, severityScore: score, notes, control };
  };

  if (!s.sceneSafe) {
    fire(32, "Environment reported as unsafe.", null,
      "Do not enter the danger area. Wait for safety support or emergency services.");
    notes.push("Scene unsafe - withhold approach.");
    control = "STOP_SCENE_UNSAFE";
    if (s.isMCI) fire(33, "Mass casualty incident confirmed.", null, "Prepare METHANE report for command.");
    return makeResult();
  }

  if (s.conscious && s.refusesTreatment) {
    fire(30, "Conscious victim refuses treatment.", null,
      "Do not perform physical treatment. Record refusal if possible.");
    notes.push("Victim refusal recorded.");
    control = "LIMIT_TO_NON_CONTACT_ASSESSMENT";
  } else if (!s.conscious) {
    fire(31, "Victim unconscious - implied consent applies.", null,
      "Continue assessment within responder's training.");
  }

  if (s.conditionChangedSinceLastCheck) {
    fire(29, "Breathing, circulation, or mental status changed since the last check.", null,
      "Re-run the full triage process and compare against the previous local record.");
  }

  if (s.canWalk) {
    if (s.walkedToWrongArea) {
      fire(2, "Walking but disoriented or moved to the wrong area.", "YELLOW",
        "Perform further assessment.");
    } else {
      fire(1, "Victim can walk.", "GREEN",
        "Direct victim to designated safe area.");
    }
  }

  const needsPrimaryAssessment = !s.canWalk || s.walkedToWrongArea || s.conditionChangedSinceLastCheck || !s.breathing;

  if (needsPrimaryAssessment && !s.breathing) {
    fire(4, "Victim is not breathing - open or reposition airway.", null,
      "Open or reposition the airway.");

    if (s.victimType === "Adult") {
      if (s.breathesAfterAirway) {
        fire(5, "Adult resumed breathing after airway repositioning.", "RED",
          "Immediate treatment required.");
      } else {
        fire(6, "Adult still not breathing after airway repositioning.", "BLACK",
          "Tag as Black. Record the finding if possible. During MCI triage, it is best to not prioritize resuscitation if other casualties still require assessment.");
      }
    } else if (s.hasPulse) {
      fire(24, "Child not breathing but has pulse - give 5 rescue breaths.", null,
        "Administer 5 rescue breaths.");
      if (s.pediatricBreathesAfterRescue) {
        fire(25, "Child resumed breathing after 5 rescue breaths.", "RED",
          "Immediate treatment required.");
      } else {
        fire(26, "Child still not breathing after rescue breaths.", "BLACK",
          "Tag as Black. Record the finding if possible. During MCI triage, it is best to not prioritize resuscitation if other casualties still require assessment.");
      }
    } else {
      fire(24, "Child not breathing and pulse absent.", "BLACK",
        "Tag as Black. Record the finding if possible. During MCI triage, it is best to not prioritize resuscitation if other casualties still require assessment.");
    }
  } else if (needsPrimaryAssessment && s.victimType === "Adult") {
    if (s.respiratoryRateUncertain) {
      notes.push("Respiratory rate marked as uncertain; continue with perfusion and mental status checks.");
      supplementalRecommendations.push("If possible, count respiratory rate again when conditions allow.");
      evaluatePerfusionAndAdultMentalStatus();
    } else if (s.respiratoryRate > 30) {
      fire(7, `Adult RR ${s.respiratoryRate} > 30/min.`, "RED",
        "Immediate treatment required.");
    } else {
      fire(8, `Adult RR ${s.respiratoryRate} <= 30/min - continue to perfusion.`, null, "");
      evaluatePerfusionAndAdultMentalStatus();
    }
  } else if (needsPrimaryAssessment) {
    if (s.respiratoryRateUncertain) {
      notes.push("Pediatric respiratory rate marked as uncertain; continue with perfusion and AVPU checks.");
      supplementalRecommendations.push("If possible, count pediatric respiratory rate again when conditions allow.");
      evaluatePediatricPerfusionAndAvpu();
    } else if (s.respiratoryRate < 15 || s.respiratoryRate > 45) {
      fire(22, `Pediatric RR ${s.respiratoryRate} outside 15-45/min.`, "RED",
        "Immediate treatment required.");
    } else {
      fire(23, `Pediatric RR ${s.respiratoryRate} within 15-45 - continue to circulation/AVPU.`, null, "");
      evaluatePediatricPerfusionAndAvpu();
    }
  }

  const blackTerminal = classifications.includes("BLACK");

  if (!blackTerminal && s.severeBleeding)
    fire(13, "Severe bleeding present.", "RED",
      "Apply direct pressure or tourniquet if appropriate and trained.");
  if (!blackTerminal && s.openFracture)
    fire(14, "Open fracture or visible bone.", "YELLOW",
      "Cover wound and splint injured area.");
  if (!blackTerminal && s.burns) {
    if (s.burnAirwayInvolvement)
      fire(15, "Burns with airway involvement or breathing difficulty.", "RED",
        "Immediate airway management.");
    else
      fire(15, "Serious burns, breathing stable.", "YELLOW",
        "Cool burn, cover, monitor.");
  }
  if (!blackTerminal && s.heatStroke)
    fire(16, "Heat stroke - high body temperature with altered mental status.", "RED",
      "Immediate cooling.");
  if (!blackTerminal && s.heatExhaustion && !s.heatStroke)
    fire(17, "Heat exhaustion - conscious and breathing normally.", "YELLOW",
      "Rest, cooling, monitoring.");
  if (!blackTerminal && s.strokeFAST)
    fire(18, "Stroke FAST signs: face, arm, or speech.", "RED",
      "Urgent transport and medical attention.");
  if (!blackTerminal && s.chestPainRadiates)
    fire(19, "Chest pain radiating to arm, jaw, back, or shoulder.", "RED",
      "Urgent medical attention - possible heart attack.");
  if (!blackTerminal && s.activeSeizure)
    fire(20, "Active seizure activity.", "RED",
      "Protect victim from surrounding hazards.");
  if (!blackTerminal && s.anaphylaxis)
    fire(21, "Anaphylaxis - severe allergic reaction with airway, swelling, or collapse.", "RED",
      "Urgent medical attention; epinephrine if available.");

  if (blackTerminal) {
    if (s.otherPatientsWaiting) {
      fire(34, "Victim meets Black criteria while other casualties still need assessment.", "BLACK",
        "Classify as Black, record the finding if possible, and continue assessing other patients.");
    } else {
      fire(34, "Victim meets Black criteria and no other casualties are waiting to be assessed.", "BLACK",
        "Classify as Black and follow local emergency protocol or responder instructions.");
    }
  }

  if (s.isMCI) {
    fire(33, "Mass casualty incident confirmed.", null,
      "Prepare METHANE report for command.");
  }

  return makeResult();

  function evaluatePerfusionAndAdultMentalStatus() {
    const capRefillDelayed = !s.capRefillUncertain && s.capRefillSeconds > 2;
    const capRefillText = s.capRefillUncertain ? "unknown" : `${s.capRefillSeconds}s`;
    const radialPulseText = s.radialPulseUncertain ? "unknown" : (s.radialPulsePresent ? "present" : "absent");

    if (s.capRefillUncertain) {
      notes.push("Capillary refill marked as uncertain; perfusion judged using radial pulse when available.");
      supplementalRecommendations.push("If possible, reassess capillary refill when conditions allow.");
    }
    if (s.radialPulseUncertain) {
      notes.push("Radial pulse marked as uncertain; perfusion judged using capillary refill when available.");
      supplementalRecommendations.push("If possible, reassess radial pulse when conditions allow.");
    }

    if ((!s.radialPulseUncertain && !s.radialPulsePresent) || capRefillDelayed) {
      fire(9, `Poor perfusion (radial pulse ${radialPulseText}, cap refill ${capRefillText}).`,
        "RED", "Provide circulation support or bleeding control.");
    } else {
      fire(10, `Adequate perfusion (radial pulse ${radialPulseText}, cap refill ${capRefillText}) - continue to mental status.`, null, "");
      if (!s.followsCommands) {
        fire(11, "Cannot follow simple commands.", "RED",
          "Immediate monitoring and treatment.");
      } else {
        fire(12, "Follows commands, breathing stable, and perfusion adequate.", "YELLOW",
          "Delayed treatment.");
      }
    }
  }

  function evaluatePediatricPerfusionAndAvpu() {
    const capRefillDelayed = !s.capRefillUncertain && s.capRefillSeconds > 2;
    const capRefillText = s.capRefillUncertain ? "unknown" : `${s.capRefillSeconds}s`;
    const radialPulseText = s.radialPulseUncertain ? "unknown" : (s.radialPulsePresent ? "present" : "absent");

    if ((!s.radialPulseUncertain && !s.radialPulsePresent) || capRefillDelayed) {
      fire(9, `Poor perfusion in child (radial pulse ${radialPulseText}, cap refill ${capRefillText}).`, "RED",
        "Provide circulation support or bleeding control.");
    }
    if (s.capRefillUncertain) {
      notes.push("Pediatric capillary refill marked as uncertain; prioritize pulse and mental status cues.");
      supplementalRecommendations.push("If possible, reassess capillary refill when conditions allow.");
    }
    if (s.radialPulseUncertain) {
      notes.push("Pediatric radial pulse marked as uncertain; prioritize capillary refill and AVPU cues.");
      supplementalRecommendations.push("If possible, reassess radial pulse when conditions allow.");
    }
    if (s.avpu === "Unresponsive" || s.avpu === "Voice" || s.avpu === "Pain") {
      fire(27, `Pediatric AVPU = ${s.avpu}.`, "RED",
        "Immediate treatment required.");
    }
  }
}
