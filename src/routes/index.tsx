import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, ArrowRight, BookOpen, FileWarning, HeartPulse, ShieldAlert, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Command Center - MCI Triage Expert System" }] }),
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
      <section className="relative overflow-hidden rounded-2xl glass p-8 md:p-12">
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-triage-red font-bold mb-4">
            <span className="h-2 w-2 rounded-full bg-triage-red animate-pulse-glow" /> Active Expert System
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Mass Casualty Incident <span className="text-triage-red">Triage</span> &<br />
            First Aid <span className="text-triage-yellow">Expert System</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Rule-based decision support for beginner first responders. Classify victims using 34 verified START,
            JumpSTART, safety, consent, and reporting rules.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow-red)] hover:opacity-95">
              <Link to="/triage"><Stethoscope className="mr-2 h-5 w-5" /> Start Triage <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" className="bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow-red)] hover:opacity-95">
              <Link to="/methane"><FileWarning className="mr-2 h-5 w-5" /> METHANE Report</Link>
            </Button>
            <Button asChild size="lg" className="bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow-red)] hover:opacity-95">
              <Link to="/rules"><BookOpen className="mr-2 h-5 w-5" /> Knowledge Base</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={AlertTriangle} value="34" label="Active Rules" color="bg-triage-red/15 text-triage-red" />
        <Stat icon={HeartPulse} value="4" label="Triage Categories" color="bg-triage-yellow/15 text-triage-yellow" />
        <Stat icon={Users} value="A/P" label="Adult & Pediatric" color="bg-triage-green/15 text-triage-green" />
        <Stat icon={Activity} value="LIVE" label="Inference Engine" color="bg-primary/15 text-primary" />
      </section>

      <section className="grid md:grid-cols-4 gap-4">
        {[
          { c: "RED", label: "Immediate", d: "Life-threatening condition requiring urgent treatment.", bg: "bg-triage-red", fg: "text-triage-red-foreground" },
          { c: "YELLOW", label: "Delayed", d: "Serious condition but not immediately life-threatening.", bg: "bg-triage-yellow", fg: "text-triage-yellow-foreground" },
          { c: "GREEN", label: "Minor", d: "Walking wounded who can move to a safe area.", bg: "bg-triage-green", fg: "text-triage-green-foreground" },
          { c: "BLACK", label: "Deceased / Expectant", d: "Not breathing after the required airway or rescue-breath step.", bg: "bg-triage-black border border-border", fg: "text-triage-black-foreground" },
        ].map((t) => (
          <Card key={t.c} className={`p-5 ${t.bg} ${t.fg}`}>
            <div className="text-xs uppercase tracking-widest opacity-80">Category</div>
            <div className="text-3xl font-extrabold mt-1">{t.c}</div>
            <div className="font-semibold">{t.label}</div>
            <div className="text-xs mt-2 opacity-90">{t.d}</div>
          </Card>
        ))}
      </section>

      <section className="glass rounded-lg p-5">
        <h2 className="font-semibold">Severity Score Meaning</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Severity score shows how urgent or critical the classification is for triage decision-making. Black is a terminal category, not a treatment-priority override.
        </p>

        <div className="grid md:grid-cols-4 gap-4 mt-4">
          {[
            { score: 95, title: "Red", desc: "Highest treatment priority.", bg: "bg-triage-red/10", badgeFg: "text-triage-red", titleColor: "text-triage-red" },
            { score: 55, title: "Yellow", desc: "Delayed treatment priority.", bg: "bg-triage-yellow/10", badgeFg: "text-triage-yellow", titleColor: "text-triage-yellow" },
            { score: 25, title: "Green", desc: "Minor priority.", bg: "bg-triage-green/10", badgeFg: "text-triage-green", titleColor: "text-triage-green" },
            { score: 10, title: "Black", desc: "Terminal after confirmed non-breathing rule.", bg: "bg-white border border-border", badgeFg: "text-triage-black", titleColor: "text-white" },
          ].map((s) => (
            <Card key={s.title} className="p-4 flex items-center gap-4">
              <div className={`flex-none h-14 w-14 rounded-lg grid place-items-center ${s.bg} ${s.badgeFg} font-mono font-extrabold text-2xl tabular-nums`}>{s.score}</div>
              <div className="min-w-0">
                <div className="flex flex-col">
                  <div className={`text-lg font-semibold ${s.titleColor}`}>{s.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card className="glass p-6">
          <ShieldAlert className="h-6 w-6 text-triage-red mb-2" />
          <h3 className="font-semibold">Forward-Chaining Engine</h3>
          <p className="text-sm text-muted-foreground mt-1">Black is terminal only by Rule 6 or Rule 26. Other conflicts resolve as Red &gt; Yellow &gt; Green.</p>
        </Card>
        <Card className="glass p-6">
          <Stethoscope className="h-6 w-6 text-triage-yellow mb-2" />
          <h3 className="font-semibold">Adult & Pediatric Paths</h3>
          <p className="text-sm text-muted-foreground mt-1">Handles START and JumpSTART flows including adult airway checks and pediatric rescue breaths.</p>
        </Card>
        <Card className="glass p-6">
          <FileWarning className="h-6 w-6 text-triage-green mb-2" />
          <h3 className="font-semibold">METHANE Reporting</h3>
          <p className="text-sm text-muted-foreground mt-1">Generate, copy, print, save, and export structured incident reports.</p>
        </Card>
        <Card className="glass p-6">
          <BookOpen className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-semibold">Non-Expert Friendly</h3>
          <p className="text-sm text-muted-foreground mt-1">Uses simple toggles, plain-language labels, AVPU meanings, and visible matched rules.</p>
        </Card>
        <Card className="glass p-6">
          <AlertTriangle className="h-6 w-6 text-triage-yellow mb-2" />
          <h3 className="font-semibold">Decision Support</h3>
          <p className="text-sm text-muted-foreground mt-1">Educational and emergency assistance support only. Follow local protocols and responder training.</p>
        </Card>
      </section>
    </div>
  );
}
