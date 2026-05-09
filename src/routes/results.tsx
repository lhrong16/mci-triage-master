import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLatest, type SavedAssessment } from "@/lib/store";
import { ArrowLeft, CheckCircle2, ListChecks, RefreshCcw, ShieldAlert, Sparkles } from "lucide-react";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [{ title: "Triage Results — MCI Expert System" }] }),
  component: Results,
});

const COLOR_STYLES: Record<string, string> = {
  RED: "bg-triage-red text-triage-red-foreground",
  YELLOW: "bg-triage-yellow text-triage-yellow-foreground",
  GREEN: "bg-triage-green text-triage-green-foreground",
  BLACK: "bg-triage-black text-triage-black-foreground border border-border",
};

function Results() {
  const nav = useNavigate();
  const [a, setA] = useState<SavedAssessment | null>(null);
  useEffect(() => { setA(getLatest()); }, []);

  if (!a) {
    return (
      <div className="px-4 md:px-8 py-16 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold">No assessment found</h1>
        <p className="text-muted-foreground mt-2">Run a triage assessment to see results.</p>
        <Button className="mt-6" onClick={()=>nav({ to: "/triage" })}>Start Assessment</Button>
      </div>
    );
  }

  const { result } = a;
  const cls = result.classification;
  const control = (result as any).control as undefined | "STOP_SCENE_UNSAFE" | "LIMIT_TO_NON_CONTACT_ASSESSMENT";

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Inference Result</div>
          <h1 className="text-2xl md:text-3xl font-bold">Triage Classification</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/triage"><RefreshCcw className="h-4 w-4 mr-1"/> Re-triage</Link></Button>
          <Button variant="ghost" asChild><Link to="/"><ArrowLeft className="h-4 w-4 mr-1"/> Home</Link></Button>
        </div>
      </div>

      {/* Verdict */}
      {control === "STOP_SCENE_UNSAFE" ? (
        <Card className="p-8 border border-triage-red bg-triage-red/10 text-triage-red">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full grid place-items-center bg-black/15 backdrop-blur">
              <ShieldAlert className="h-9 w-9"/>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-80">Assessment Paused</div>
              <div className="text-3xl font-extrabold tracking-tight">Scene Unsafe</div>
              <div className="opacity-90 font-semibold">Do not enter the danger area. Wait for safety support or emergency services.</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs uppercase opacity-80">Severity</div>
              <div className="text-4xl font-extrabold tabular-nums">—</div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className={`p-8 ${COLOR_STYLES[cls]} ${cls==="RED" ? "shadow-[var(--shadow-glow-red)]" : ""}`}>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full grid place-items-center bg-black/15 backdrop-blur">
              <ShieldAlert className="h-9 w-9"/>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest opacity-80">Final Category</div>
              <div className="text-5xl font-extrabold tracking-tight">{cls}</div>
              <div className="opacity-90 font-semibold">
                {cls==="RED"&&"Immediate — life-threatening"}
                {cls==="YELLOW"&&"Delayed — serious but stable"}
                {cls==="GREEN"&&"Minor — walking wounded"}
                {cls==="BLACK"&&"Expectant — do not prioritize during MCI"}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs uppercase opacity-80">Severity</div>
              <div className="text-4xl font-extrabold tabular-nums">{result.severityScore}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reasoning trace */}
        <Card className="glass p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-triage-yellow"/>
            <h2 className="font-semibold">Reasoning Process</h2>
          </div>
          <ol className="relative border-l border-border ml-3 space-y-3">
            {result.fired.map((f, i) => (
              <li key={i} className="ml-4">
                <span className={`absolute -left-2 mt-1 h-4 w-4 rounded-full grid place-items-center text-[9px] font-bold ${
                  f.classification ? COLOR_STYLES[f.classification] : "bg-muted text-muted-foreground"
                }`}>{f.id}</span>
                <div className="text-sm font-medium">Rule {f.id}: {f.title}</div>
                <div className="text-xs text-muted-foreground">{f.reason}</div>
                {f.classification && <Badge className={`mt-1 ${COLOR_STYLES[f.classification]}`}>{f.classification}</Badge>}
              </li>
            ))}
          </ol>
          {result.notes.length > 0 && (
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              {result.notes.map((n,i) => <div key={i}>• {n}</div>)}
            </div>
          )}
        </Card>

        {/* Recommendations */}
        <Card className="glass p-5">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="h-5 w-5 text-triage-green"/>
            <h2 className="font-semibold">Recommended Immediate Actions</h2>
          </div>
          <ul className="space-y-2">
            {result.recommendations.length === 0 && (
              <li className="text-sm text-muted-foreground">Continue monitoring; no critical actions queued.</li>
            )}
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-triage-green shrink-0 mt-0.5"/>
                <span className={r === "Do not perform physical treatment. Record refusal if possible." ? "font-bold text-triage-red" : ""}>{r}</span>
              </li>
            ))}
          </ul>

          {a.symptoms.isMCI && (
            <div className="mt-5 p-3 rounded-lg border border-triage-yellow/40 bg-triage-yellow/10">
              <div className="text-sm font-semibold text-triage-yellow">MCI declared — generate METHANE</div>
              <Button asChild size="sm" className="mt-2"><Link to="/methane">Open METHANE Report →</Link></Button>
            </div>
          )}
        </Card>
      </div>

      {/* Matched rules timeline */}
      <Card className="glass p-5">
        <h2 className="font-semibold mb-3">Matched Rules ({result.fired.length})</h2>
        <div className="flex flex-wrap gap-2">
          {result.fired.map(f => (
            <Badge key={f.id} variant="outline" className="font-mono">R{f.id} · {f.title}</Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
