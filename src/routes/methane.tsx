import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveReport } from "@/lib/store";
import { toast } from "sonner";
import { Copy, FileWarning, Printer, Save } from "lucide-react";

export const Route = createFileRoute("/methane")({
  head: () => ({ meta: [{ title: "METHANE Report — MCI Expert System" }] }),
  component: Methane,
});

function Methane() {
  const [f, setF] = useState({
    major: "Mass casualty incident DECLARED",
    location: "",
    type: "",
    hazards: "",
    access: "",
    casualties: "",
    services: "",
  });

  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const report = `=== METHANE REPORT ===
Time: ${new Date().toUTCString()}

M — Major Incident: ${f.major}
E — Exact Location: ${f.location}
T — Type of Incident: ${f.type}
H — Hazards: ${f.hazards}
A — Access Routes: ${f.access}
N — Number/Severity of Casualties: ${f.casualties}
E — Emergency Services Required/Present: ${f.services}
======================`;

  const copy = async () => { await navigator.clipboard.writeText(report); toast.success("Report copied"); };
  const print = () => window.print();
  const save = () => { saveReport(f); toast.success("Report saved"); };

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <FileWarning className="h-4 w-4 text-triage-yellow"/> Rule 33 — Incident Reporting
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">METHANE Emergency Report</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass p-5 space-y-3">
          {[
            ["major","M — Major Incident", "input"],
            ["location","E — Exact Location", "input"],
            ["type","T — Type of Incident", "input"],
            ["hazards","H — Hazards Present", "textarea"],
            ["access","A — Access Routes", "textarea"],
            ["casualties","N — Casualties (number/severity)", "textarea"],
            ["services","E — Emergency Services required/present", "textarea"],
          ].map(([k,l,kind]) => (
            <div key={k}>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{l}</Label>
              {kind === "input" ? (
                <Input value={(f as any)[k]} onChange={e=>set(k as any, e.target.value)} className="mt-1"/>
              ) : (
                <Textarea value={(f as any)[k]} onChange={e=>set(k as any, e.target.value)} className="mt-1" rows={2}/>
              )}
            </div>
          ))}
        </Card>

        <Card className="glass p-0 overflow-hidden">
          <div className="bg-triage-red/15 px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="text-sm font-semibold text-triage-red">METHANE OUTPUT</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copy}><Copy className="h-4 w-4 mr-1"/>Copy</Button>
              <Button size="sm" variant="outline" onClick={print}><Printer className="h-4 w-4 mr-1"/>Print</Button>
              <Button size="sm" onClick={save}><Save className="h-4 w-4 mr-1"/>Save</Button>
            </div>
          </div>
          <pre className="p-5 text-xs font-mono whitespace-pre-wrap leading-relaxed">{report}</pre>
        </Card>
      </div>
    </div>
  );
}
