import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { defaultSymptoms, runInference, type Symptoms } from "@/lib/expert/engine";
import { getLatest, saveAssessment } from "@/lib/store";
import { Activity, ArrowLeft, ArrowRight, Brain, Flame, HeartPulse, RefreshCcw, ShieldAlert, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/triage")({
  head: () => ({ meta: [{ title: "Triage Assessment - MCI Expert System" }] }),
  component: Triage,
});

function Toggle({ label, hint, value, onChange, danger, disabled }: any) {
  return (
    <div className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${value && danger ? "border-triage-red/60 bg-triage-red/10" : "border-border bg-card/40"} ${disabled ? "opacity-60" : ""}`}>
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <Switch checked={value} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}

const adultDefaultRate = 18;
const pediatricDefaultRate = 24;

function Triage() {
  const nav = useNavigate();
  const [s, setS] = useState<Symptoms>(defaultSymptoms());
  const [step, setStep] = useState(0);

  const patchSymptoms = (patch: Partial<Symptoms>) => {
    setS((prev) => {
      const next = { ...prev, ...patch };

      if (patch.victimType === "Adult") {
        next.pediatricBreathesAfterRescue = false;
        next.respiratoryRate = next.breathing ? adultDefaultRate : next.respiratoryRate;
      }
      if (patch.victimType === "Pediatric") {
        next.breathesAfterAirway = false;
        next.respiratoryRate = next.breathing ? pediatricDefaultRate : next.respiratoryRate;
      }

      if (patch.conscious === true) {
        next.canWalk = true;
        next.breathing = true;
        next.hasPulse = true;
        next.followsCommands = true;
        next.avpu = "Alert";
        next.respiratoryRate = next.victimType === "Pediatric" ? pediatricDefaultRate : adultDefaultRate;
      }
      if (patch.conscious === false) {
        next.walkedToWrongArea = false;
        next.followsCommands = false;
        next.avpu = "Unresponsive";
      }

      if (patch.breathing === true) {
        next.breathesAfterAirway = false;
        next.pediatricBreathesAfterRescue = false;
        next.respiratoryRate = next.victimType === "Pediatric" ? pediatricDefaultRate : adultDefaultRate;
      }
      if (patch.breathing === false) {
        next.respiratoryRate = 0;
      }

      if (patch.breathesAfterAirway === true) {
        next.breathing = false;
        next.pediatricBreathesAfterRescue = false;
        next.respiratoryRate = adultDefaultRate;
      }
      if (patch.breathesAfterAirway === false && !next.breathing && next.victimType === "Adult") {
        next.respiratoryRate = 0;
      }

      if (patch.pediatricBreathesAfterRescue === true) {
        next.breathing = false;
        next.breathesAfterAirway = false;
        next.hasPulse = true;
        next.respiratoryRate = pediatricDefaultRate;
      }
      if (patch.pediatricBreathesAfterRescue === false && !next.breathing && next.victimType === "Pediatric") {
        next.respiratoryRate = 0;
      }

      if (patch.radialPulseUncertain === true) next.radialPulsePresent = true;
      if (patch.capRefillUncertain === true) next.capRefillSeconds = 2;

      return next;
    });
  };

  const update = <K extends keyof Symptoms>(k: K, v: Symptoms[K]) => patchSymptoms({ [k]: v } as Partial<Symptoms>);

  const loadLatestForRetriage = () => {
    const latest = getLatest();
    if (!latest) {
      patchSymptoms({ conditionChangedSinceLastCheck: true });
      return;
    }
    setS({ ...latest.symptoms, conditionChangedSinceLastCheck: true });
  };

  const steps = useMemo(() => [
    {
      title: "Scene & Victim",
      icon: ShieldAlert,
      content: (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border bg-card/40">
            <Label className="text-sm">Victim type</Label>
            <RadioGroup value={s.victimType} onValueChange={(v: any) => update("victimType", v)} className="flex gap-3 mt-2">
              <label className="flex items-center gap-2"><RadioGroupItem value="Adult" /> Adult</label>
              <label className="flex items-center gap-2"><RadioGroupItem value="Pediatric" /> Pediatric</label>
            </RadioGroup>
          </div>
          <Toggle label="Scene is safe" hint="Rule 32 - do not enter unsafe areas." value={s.sceneSafe} onChange={(v: boolean) => update("sceneSafe", v)} />
          <Toggle label="Victim conscious" hint="When on, Can walk, Breathing, and Has pulse are set on." value={s.conscious} onChange={(v: boolean) => update("conscious", v)} />
          <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-card/40">
            <div>
              <Label className="text-sm font-medium">Condition changed since last check</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Rule 29 - keeps the previous local record and starts from its last inputs.</p>
            </div>
            <Button size="sm" variant={s.conditionChangedSinceLastCheck ? "default" : "outline"} onClick={loadLatestForRetriage}>
              <RefreshCcw className="h-4 w-4 mr-1" /> Re-triage
            </Button>
          </div>
          <Toggle label="Refuses treatment" hint="Rule 30 - record refusal if conscious." value={s.refusesTreatment} onChange={(v: boolean) => update("refusesTreatment", v)} danger />
          <Toggle label="Mass casualty incident" hint="Triggers METHANE (Rule 33)." value={s.isMCI} onChange={(v: boolean) => update("isMCI", v)} />
          <Toggle label="Other patients waiting" hint="Rule 34 - if this victim meets Black criteria, tag and continue assessing others." value={s.otherPatientsWaiting} onChange={(v: boolean) => update("otherPatientsWaiting", v)} />
        </div>
      ),
    },
    {
      title: "Mobility & Airway",
      icon: Activity,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card/40 p-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Active path</div>
            <div className="text-lg font-semibold">{s.victimType === "Adult" ? "Adult START airway path" : "Pediatric JumpSTART rescue-breath path"}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Toggle label="Can walk" value={s.canWalk} onChange={(v: boolean) => update("canWalk", v)} />
            <Toggle label="Walked to wrong area / confused" hint="Only applies if the victim is conscious and able to move." value={s.walkedToWrongArea} disabled={!s.conscious} onChange={(v: boolean) => update("walkedToWrongArea", v)} />
            <Toggle label="Breathing now" value={s.breathing} onChange={(v: boolean) => update("breathing", v)} danger={!s.breathing} />
            {s.victimType === "Adult" ? (
              <Toggle label="Resumed breathing after 5 seconds / airway repositioning" hint="Adult path - Rule 5. If off after not breathing, respiratory rate stays 0." value={s.breathesAfterAirway} onChange={(v: boolean) => update("breathesAfterAirway", v)} />
            ) : (
              <>
                <Toggle label="Has pulse" hint="Pediatric apnea check before rescue breaths." value={s.hasPulse} onChange={(v: boolean) => update("hasPulse", v)} />
                <Toggle label="Resumed breathing after 5 rescue breaths" hint="Pediatric path - Rule 25. If off after not breathing, respiratory rate stays 0." value={s.pediatricBreathesAfterRescue} onChange={(v: boolean) => update("pediatricBreathesAfterRescue", v)} />
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Vitals",
      icon: HeartPulse,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/40">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Respiratory rate (breaths/min)</Label>
              <span className="font-mono text-2xl text-triage-red">{s.respiratoryRate}</span>
            </div>
            <Slider min={0} max={60} step={1} value={[s.respiratoryRate]} onValueChange={([v]) => update("respiratoryRate", v)} className="mt-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span><span>Adult limit 30</span><span>Pediatric 15-45</span><span>60</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-card/40">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Radial pulse</Label>
                <span className="text-sm font-semibold">{s.radialPulseUncertain ? "I'm not sure" : s.radialPulsePresent ? "Present" : "Absent"}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={!s.radialPulseUncertain && s.radialPulsePresent ? "default" : "outline"} onClick={() => patchSymptoms({ radialPulsePresent: true, radialPulseUncertain: false })}>Present</Button>
                <Button type="button" size="sm" variant={!s.radialPulseUncertain && !s.radialPulsePresent ? "default" : "outline"} onClick={() => patchSymptoms({ radialPulsePresent: false, radialPulseUncertain: false })}>Absent</Button>
                <Button type="button" size="sm" variant={s.radialPulseUncertain ? "default" : "outline"} onClick={() => update("radialPulseUncertain", !s.radialPulseUncertain)}>I'm not sure</Button>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card/40">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Capillary refill (seconds)</Label>
                <span className="font-mono text-xl">{s.capRefillUncertain ? "Unknown" : `${s.capRefillSeconds}s`}</span>
              </div>
              <Slider min={0} max={6} step={1} disabled={s.capRefillUncertain} value={[s.capRefillSeconds]} onValueChange={([v]) => update("capRefillSeconds", v)} className="mt-3" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">Not sure about capillary refill? Mark it unknown.</p>
                <Button type="button" size="sm" variant={s.capRefillUncertain ? "default" : "outline"} onClick={() => update("capRefillUncertain", !s.capRefillUncertain)}>
                  I'm not sure
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Mental Status",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Toggle label="Follows simple commands" value={s.followsCommands} onChange={(v: boolean) => update("followsCommands", v)} />
            <div className="p-3 rounded-lg border border-border bg-card/40">
              <Label className="text-sm">AVPU response</Label>
              <RadioGroup value={s.avpu} onValueChange={(v: any) => update("avpu", v)} className="grid grid-cols-2 gap-2 mt-2">
                {["Alert", "Voice", "Pain", "Unresponsive"].map((o) => (
                  <label key={o} className="flex items-center gap-2"><RadioGroupItem value={o} /> {o}</label>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground mt-2">For pediatric victims, Voice, Pain, or Unresponsive triggers Red.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              ["Alert", "Awake, looking around, can answer or respond normally."],
              ["Voice", "Does not seem fully alert, but responds when spoken to."],
              ["Pain", "Does not respond to voice, but moves or pulls away when pinched or given a painful stimulus."],
              ["Unresponsive", "No response to voice or pain; cannot talk, move purposefully, or follow commands."],
            ].map(([term, meaning]) => (
              <div key={term} className="rounded-lg border border-border bg-card/40 p-3">
                <div className="font-semibold text-sm">{term}</div>
                <p className="text-xs text-muted-foreground mt-1">{meaning}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Trauma & Medical",
      icon: Flame,
      content: (
        <div className="grid md:grid-cols-2 gap-3">
          <Toggle label="Severe bleeding" value={s.severeBleeding} onChange={(v: boolean) => update("severeBleeding", v)} danger />
          <Toggle label="Open fracture / visible bone" value={s.openFracture} onChange={(v: boolean) => update("openFracture", v)} />
          <Toggle label="Burns present" value={s.burns} onChange={(v: boolean) => update("burns", v)} />
          <Toggle label="Burns with airway involvement" value={s.burnAirwayInvolvement} onChange={(v: boolean) => update("burnAirwayInvolvement", v)} danger />
          <Toggle label="Heat stroke (high temp + altered mental)" value={s.heatStroke} onChange={(v: boolean) => update("heatStroke", v)} danger />
          <Toggle label="Heat exhaustion" value={s.heatExhaustion} onChange={(v: boolean) => update("heatExhaustion", v)} />
          <Toggle label="Stroke FAST signs" value={s.strokeFAST} onChange={(v: boolean) => update("strokeFAST", v)} danger />
          <Toggle label="Chest pain radiating" value={s.chestPainRadiates} onChange={(v: boolean) => update("chestPainRadiates", v)} danger />
          <Toggle label="Active seizure" value={s.activeSeizure} onChange={(v: boolean) => update("activeSeizure", v)} danger />
          <Toggle label="Anaphylaxis (severe allergic reaction)" value={s.anaphylaxis} onChange={(v: boolean) => update("anaphylaxis", v)} danger />
        </div>
      ),
    },
  ], [s]);

  const progress = ((step + 1) / steps.length) * 100;
  const StepIcon = steps[step].icon;

  const submit = () => {
    const result = runInference(s);
    saveAssessment(s, result);
    nav({ to: "/results" });
  };

  return (
    <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Stethoscope className="h-4 w-4 text-triage-red" /> Triage Assessment Wizard
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Step {step + 1} of {steps.length}: {steps[step].title}</h1>
        <Progress value={progress} className="mt-3 h-2" />
      </div>

      <Card className="glass p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-lg grid place-items-center bg-triage-red/15 text-triage-red"><StepIcon className="h-5 w-5" /></div>
          <div className="font-semibold">{steps[step].title}</div>
        </div>
        {steps[step].content}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => (!s.sceneSafe ? submit() : setStep((current) => current + 1))} className="bg-[var(--gradient-emergency)]">
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={submit} className="bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow-red)]">
            Run Inference Engine <ShieldAlert className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
