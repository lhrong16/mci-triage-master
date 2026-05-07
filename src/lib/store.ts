import type { InferenceResult } from "./expert/engine";
import type { Symptoms } from "./expert/engine";

const ASSESS_KEY = "mci_assessments";
const LATEST_KEY = "mci_latest";
const REPORT_KEY = "mci_methane_reports";

export interface SavedAssessment {
  id: string;
  timestamp: number;
  symptoms: Symptoms;
  result: InferenceResult;
}

export function saveAssessment(symptoms: Symptoms, result: InferenceResult): SavedAssessment {
  const item: SavedAssessment = { id: crypto.randomUUID(), timestamp: Date.now(), symptoms, result };
  if (typeof window === "undefined") return item;
  const list = listAssessments();
  list.unshift(item);
  localStorage.setItem(ASSESS_KEY, JSON.stringify(list.slice(0, 200)));
  localStorage.setItem(LATEST_KEY, JSON.stringify(item));
  return item;
}
export function listAssessments(): SavedAssessment[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ASSESS_KEY) || "[]"); } catch { return []; }
}
export function getLatest(): SavedAssessment | null {
  if (typeof window === "undefined") return null;
  try { const v = localStorage.getItem(LATEST_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}

export interface MethaneReport {
  id: string;
  timestamp: number;
  major: string; location: string; type: string; hazards: string;
  access: string; casualties: string; services: string;
}
export function saveReport(r: Omit<MethaneReport,"id"|"timestamp">): MethaneReport {
  const item: MethaneReport = { ...r, id: crypto.randomUUID(), timestamp: Date.now() };
  if (typeof window === "undefined") return item;
  const list = listReports(); list.unshift(item);
  localStorage.setItem(REPORT_KEY, JSON.stringify(list.slice(0, 100)));
  return item;
}
export function listReports(): MethaneReport[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(REPORT_KEY) || "[]"); } catch { return []; }
}
