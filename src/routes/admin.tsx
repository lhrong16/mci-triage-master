import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listAssessments, listReports, type SavedAssessment, type MethaneReport } from "@/lib/store";
import { Database, FileWarning } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Records — MCI Expert System" }] }),
  component: Admin,
});

const COLOR: Record<string,string> = {
  RED:"bg-triage-red text-triage-red-foreground",
  YELLOW:"bg-triage-yellow text-triage-yellow-foreground",
  GREEN:"bg-triage-green text-triage-green-foreground",
  BLACK:"bg-triage-black text-triage-black-foreground border border-border",
};

function Admin() {
  const [a, setA] = useState<SavedAssessment[]>([]);
  const [r, setR] = useState<MethaneReport[]>([]);
  const [q, setQ] = useState("");
  useEffect(()=>{ setA(listAssessments()); setR(listReports()); },[]);

  const stats = useMemo(()=>{
    const c = { RED:0, YELLOW:0, GREEN:0, BLACK:0 };
    a.forEach(x => { c[x.result.classification]++; });
    return c;
  },[a]);

  const filtered = a.filter(x => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));

  const max = Math.max(1, ...Object.values(stats));

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Database className="h-4 w-4"/> Local Records
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Incident Records & Analytics</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["RED","YELLOW","GREEN","BLACK"] as const).map(c => (
          <Card key={c} className={`p-4 ${COLOR[c]}`}>
            <div className="text-xs uppercase opacity-80">{c}</div>
            <div className="text-3xl font-bold">{stats[c]}</div>
          </Card>
        ))}
      </div>

      <Card className="glass p-5">
        <h2 className="font-semibold mb-3">Triage Distribution</h2>
        <div className="space-y-2">
          {(["RED","YELLOW","GREEN","BLACK"] as const).map(c => (
            <div key={c} className="flex items-center gap-3">
              <div className="w-16 text-xs font-semibold">{c}</div>
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${COLOR[c]}`} style={{ width: `${(stats[c]/max)*100}%` }}/>
              </div>
              <div className="w-10 text-right text-sm font-mono">{stats[c]}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold">Assessments ({a.length})</h2>
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." className="max-w-xs"/>
        </div>
        <div className="mt-4 divide-y divide-border">
          {filtered.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No records yet. <Link to="/triage" className="text-primary underline">Run an assessment</Link>.</p>}
          {filtered.map(x => (
            <div key={x.id} className="py-3 flex items-center gap-3 flex-wrap">
              <Badge className={COLOR[x.result.classification]}>{x.result.classification}</Badge>
              <div className="text-sm">{x.symptoms.victimType}</div>
              <div className="text-xs text-muted-foreground">{new Date(x.timestamp).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground ml-auto">{x.result.fired.length} rules fired</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileWarning className="h-4 w-4 text-triage-yellow"/>
          <h2 className="font-semibold">METHANE Reports ({r.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {r.length === 0 && <p className="text-sm text-muted-foreground py-4">No reports saved.</p>}
          {r.map(x => (
            <div key={x.id} className="py-3">
              <div className="text-sm font-semibold">{x.location || "Unknown location"} — {x.type || "Unspecified"}</div>
              <div className="text-xs text-muted-foreground">{new Date(x.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
