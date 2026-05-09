import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, ArrowRight, BookOpen, FileWarning, HeartPulse, ShieldAlert, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Command Center — MCI Triage Expert System" }] }),
  component: Index,
});

function Stat({ icon: Icon, label, value, color }: any) {
  return (
    <Card className="glass p-5">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg grid place-items-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      </div>
    </Card>
  );
}

function Index() {
  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl glass p-8 md:p-12">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
             style={{ background: "radial-gradient(circle at 20% 20%, var(--triage-red) 0%, transparent 40%), radial-gradient(circle at 80% 80%, var(--triage-yellow) 0%, transparent 45%)" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-triage-red font-bold mb-4">
            <span className="h-2 w-2 rounded-full bg-triage-red animate-pulse-glow"/> Active Expert System
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Mass Casualty Incident <span className="text-triage-red">Triage</span> &<br/>
            First Aid <span className="text-triage-yellow">Expert System</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Rule-based decision support for first responders. Classify victims using 33 verified triage rules,
            generate METHANE reports, and access the complete knowledge base.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow-red)] hover:opacity-95">
              <Link to="/triage"><Stethoscope className="mr-2 h-5 w-5"/> Start Triage <ArrowRight className="ml-1 h-4 w-4"/></Link>
            </Button>
            <Button asChild size="lg" className="bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow-red)] hover:opacity-95">
              <Link to="/methane"><FileWarning className="mr-2 h-5 w-5"/> METHANE Report</Link>
            </Button>
            <Button asChild size="lg" className="bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow-red)] hover:opacity-95">
              <Link to="/rules"><BookOpen className="mr-2 h-5 w-5"/> Knowledge Base</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={AlertTriangle} value="33" label="Active Rules" color="bg-triage-red/15 text-triage-red" />
        <Stat icon={HeartPulse} value="4" label="Triage Categories" color="bg-triage-yellow/15 text-triage-yellow" />
        <Stat icon={Users} value="A/P" label="Adult & Pediatric" color="bg-triage-green/15 text-triage-green" />
        <Stat icon={Activity} value="LIVE" label="Inference Engine" color="bg-primary/15 text-primary" />
      </section>

      {/* Triage colors */}
      <section className="grid md:grid-cols-4 gap-4">
        {[
          { c: "RED", label: "Immediate", d: "Life-threatening; immediate treatment.", bg: "bg-triage-red", fg: "text-triage-red-foreground" },
          { c: "YELLOW", label: "Delayed", d: "Serious but stable; delayed treatment.", bg: "bg-triage-yellow", fg: "text-triage-yellow-foreground" },
          { c: "GREEN", label: "Minor", d: "Walking wounded; minor injuries.", bg: "bg-triage-green", fg: "text-triage-green-foreground" },
          { c: "BLACK", label: "Expectant", d: "Deceased / not breathing after airway.", bg: "bg-triage-black border border-border", fg: "text-triage-black-foreground" },
        ].map(t => (
          <Card key={t.c} className={`p-5 ${t.bg} ${t.fg}`}>
            <div className="text-xs uppercase tracking-widest opacity-80">Category</div>
            <div className="text-3xl font-extrabold mt-1">{t.c}</div>
            <div className="font-semibold">{t.label}</div>
            <div className="text-xs mt-2 opacity-90">{t.d}</div>
          </Card>
        ))}
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card className="glass p-6">
          <ShieldAlert className="h-6 w-6 text-triage-red mb-2"/>
          <h3 className="font-semibold">Forward-Chaining Engine</h3>
          <p className="text-sm text-muted-foreground mt-1">Evaluates symptoms sequentially with conflict resolution (Red &gt; Yellow &gt; Green).</p>
        </Card>
        <Card className="glass p-6">
          <Stethoscope className="h-6 w-6 text-triage-yellow mb-2"/>
          <h3 className="font-semibold">Adult & Pediatric Paths</h3>
          <p className="text-sm text-muted-foreground mt-1">Handles START and JumpSTART-style flows including rescue breaths.</p>
        </Card>
        <Card className="glass p-6">
          <FileWarning className="h-6 w-6 text-triage-green mb-2"/>
          <h3 className="font-semibold">METHANE Reporting</h3>
          <p className="text-sm text-muted-foreground mt-1">Generate, copy, print, and export structured incident reports.</p>
        </Card>
        <Card className="glass p-6">
          <BookOpen className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-semibold">How to Use</h3>
          <p className="text-sm text-muted-foreground mt-1">Start the assessment, follow the 5 steps, toggle only what you observe, then run the engine on the final step.</p>
        </Card>
        <Card className="glass p-6">
          <AlertTriangle className="h-6 w-6 text-triage-yellow mb-2" />
          <h3 className="font-semibold">Terms &amp; Conditions</h3>
          <p className="text-sm text-muted-foreground mt-1">Decision-support only. Please follow local protocols, use clinical judgment, and confirm before acting.</p>
        </Card>
      </section>
    </div>
  );
}
