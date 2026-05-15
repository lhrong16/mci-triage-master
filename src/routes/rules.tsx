import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RULES } from "@/lib/expert/rules";
import { BookOpen, Search } from "lucide-react";

export const Route = createFileRoute("/rules")({
  head: () => ({ meta: [{ title: "Rule Knowledge Base - MCI Expert System" }] }),
  component: Rules,
});

const FILTERS = ["All", "Adult", "Pediatric", "Trauma", "Medical", "Consent", "Safety", "Process"] as const;

function Rules() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<typeof FILTERS[number]>("All");
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const filtered = useMemo(() => RULES.filter((r) => {
    const matchesQ = !q || `${r.id} ${r.title} ${r.condition} ${r.action}`.toLowerCase().includes(q.toLowerCase());
    const matchesF = f === "All" || r.category.includes(f as any);
    return matchesQ && matchesF;
  }), [q, f]);

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <BookOpen className="h-4 w-4" /> Knowledge Base
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">{RULES.length} Verified Triage Rules</h1>
        <p className="text-sm text-muted-foreground mt-1">Searchable expert system rule set used by the inference engine.</p>
      </div>

      <Card className="glass p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rules..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((x) => (
            <Button key={x} size="sm" variant={f === x ? "default" : "outline"} onClick={() => setF(x)}>{x}</Button>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((r) => {
          const isOpen = open[r.id] ?? false;
          return (
            <Card key={r.id} className="glass p-5 cursor-pointer hover:border-primary/40 transition" onClick={() => setOpen((o) => ({ ...o, [r.id]: !isOpen }))}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-triage-red">RULE {String(r.id).padStart(2, "0")}</div>
                  <div className="font-semibold">{r.title}</div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {r.category.map((c) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
                </div>
              </div>
              <div className="mt-3 font-mono text-xs whitespace-pre-wrap">
                <div className="text-triage-yellow">{r.condition}</div>
                {isOpen && <div className="text-triage-green mt-2">{r.action}</div>}
              </div>
              {!isOpen && <div className="text-xs text-muted-foreground mt-2">Click to expand action...</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
