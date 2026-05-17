import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deleteAssessment, deleteReport, listAssessments, listReports, type MethaneReport, type SavedAssessment } from "@/lib/store";
import { formatMalaysiaTime } from "@/lib/utils";
import { Database, Download, Eye, FileText, FileWarning, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Records - MCI Expert System" }] }),
  component: Admin,
});

const COLOR: Record<string, string> = {
  RED: "bg-triage-red text-triage-red-foreground",
  YELLOW: "bg-triage-yellow text-triage-yellow-foreground",
  GREEN: "bg-triage-green text-triage-green-foreground",
  BLACK: "bg-triage-black text-triage-black-foreground border border-border",
};

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char] as string);
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function downloadPdf(filename: string, text: string) {
  const lines = text
    .split("\n")
    .flatMap((line) => line.length > 92 ? line.match(/.{1,92}(\s|$)/g) || [line] : [line])
    .map((line) => line.trimEnd());
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += 42) pages.push(lines.slice(i, i + 42));

  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };
  const catalogId = add("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = add("");
  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds: number[] = [];

  pages.forEach((page) => {
    const content = [
      "BT",
      "/F1 10 Tf",
      "50 790 Td",
      "14 TL",
      ...page.map((line, index) => `${index === 0 ? "" : "T* "}(${pdfEscape(line)}) Tj`),
      "ET",
    ].join("\n");
    const contentId = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  downloadFile(filename, pdf, "application/pdf");
}

function assessmentText(x: SavedAssessment) {
  return [
    "TRIAGE ASSESSMENT RECORD",
    `Time: ${formatMalaysiaTime(x.timestamp)}`,
    `Victim type: ${x.symptoms.victimType}`,
    `Classification: ${x.result.classification}`,
    `Severity score: ${x.result.severityScore}`,
    `Priority explanation: ${priorityExplanation(x.result.classification)}`,
    "",
    "Matched rules:",
    ...x.result.fired.map((f) => `R${f.id} - ${f.title}: ${f.reason}`),
    "",
    "Recommendations:",
    ...(x.result.recommendations.length ? x.result.recommendations.map((r) => `- ${r}`) : ["- No immediate actions queued."]),
    "",
    "Notes:",
    ...(x.result.notes.length ? x.result.notes.map((n) => `- ${n}`) : ["- None"]),
  ].join("\n");
}

function reportText(x: MethaneReport) {
  return `METHANE REPORT
Time: ${formatMalaysiaTime(x.timestamp)}

M - Major Incident: ${x.major}
E - Exact Location: ${x.location}
T - Type of Incident: ${x.type}
H - Hazards: ${x.hazards}
A - Access Routes: ${x.access}
N - Number/Severity of Casualties: ${x.casualties}
E - Emergency Services Required/Present: ${x.services}`;
}

function methanePrintField(label: string, value: string, textarea = false) {
  const tag = textarea ? "div" : "div";
  const minHeight = textarea ? "48px" : "28px";
  return `<label>
    <span>${escapeHtml(label)}</span>
    <${tag} class="field" style="min-height:${minHeight}">${escapeHtml(value)}</${tag}>
  </label>`;
}

function openMethanePrintView(x: MethaneReport) {
  const output = `=== METHANE REPORT ===
Time: ${formatMalaysiaTime(x.timestamp)}

M - Major Incident: ${x.major}
E - Exact Location: ${x.location}
T - Type of Incident: ${x.type}
H - Hazards: ${x.hazards}
A - Access Routes: ${x.access}
N - Number/Severity of Casualties: ${x.casualties}
E - Emergency Services Required/Present: ${x.services}
======================`;

  const html = `<!doctype html>
    <html>
      <head>
        <title>METHANE Report - MCI Expert System</title>
        <style>
          *{box-sizing:border-box}
          body{font-family:Arial,sans-serif;margin:0;background:#fff;color:#1f2937;font-size:12px}
          .page{width:794px;min-height:1123px;margin:0 auto;padding:28px 34px}
          .top{border:1px solid #9ca3af;padding:12px 16px;display:flex;justify-content:space-between;color:#374151;font-size:11px}
          .eyebrow{margin-top:28px;color:#6b7280;text-transform:uppercase;letter-spacing:.12em;font-size:11px;font-weight:700}
          h1{font-size:22px;margin:10px 0 8px;color:#9ca3af}
          .note{margin:0 0 22px;color:#374151}
          .form{border:1px solid #9ca3af;border-radius:12px;padding:18px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.18)}
          .output{margin-top:28px;border:1px solid #9ca3af;border-radius:12px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.18);overflow:hidden}
          .output-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #9ca3af;padding:12px 16px;color:#ff2d45;font-weight:700}
          .output-actions{display:flex;gap:8px;color:#9ca3af;font-size:11px}
          .fake-button{border:1px solid #9ca3af;border-radius:8px;padding:6px 14px;color:#6b7280}
          pre{margin:0;padding:18px;font-size:12px;line-height:1.55;color:#6b7280;white-space:pre-wrap}
          label{display:block;margin-bottom:14px}
          label span{display:block;margin-bottom:6px;color:#4b5563;text-transform:uppercase;font-size:11px;font-weight:700}
          .field{border:1px solid #374151;border-radius:8px;padding:8px 10px;color:#111827;white-space:pre-wrap;line-height:1.35}
          .footer{position:fixed;left:34px;right:34px;bottom:18px;display:flex;justify-content:space-between;font-size:10px;color:#111827}
          @media print{body{background:#fff}.page{margin:0}.footer{position:fixed}}
        </style>
      </head>
      <body>
        <main class="page">
          <div class="top">
            <div>${escapeHtml(formatMalaysiaTime(new Date(x.timestamp)))}</div>
            <strong>METHANE Report - MCI Expert System</strong>
            <div>Emergency Operations</div>
          </div>
          <div class="eyebrow">Rule 33 - Incident Reporting</div>
          <h1>METHANE Emergency Report</h1>
          <p class="note">METHANE is for incident reporting. It does not change the victim's triage category.</p>
          <section class="form">
            ${methanePrintField("M - Major Incident", x.major)}
            ${methanePrintField("E - Exact Location", x.location)}
            ${methanePrintField("T - Type of Incident", x.type)}
            ${methanePrintField("H - Hazards Present", x.hazards, true)}
            ${methanePrintField("A - Access Routes", x.access, true)}
            ${methanePrintField("N - Casualties (Number/Severity)", x.casualties, true)}
            ${methanePrintField("E - Emergency Services Required/Present", x.services, true)}
          </section>
          <section class="output">
            <div class="output-head">
              <span>METHANE OUTPUT</span>
              <span class="output-actions">
                <span class="fake-button">Copy</span>
                <span class="fake-button">Print</span>
                <span class="fake-button">Save</span>
              </span>
            </div>
            <pre>${escapeHtml(output)}</pre>
          </section>
        </main>
        <div class="footer"><span>Incident record</span><span>1/1</span></div>
        <script>
          window.onload = () => {
            window.focus();
            setTimeout(() => window.print(), 250);
          };
        </script>
      </body>
    </html>`;

  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const win = window.open(url, "_blank");
  if (win) setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function priorityExplanation(classification: string) {
  if (classification === "RED") return "Highest treatment priority.";
  if (classification === "YELLOW") return "Delayed treatment priority.";
  if (classification === "GREEN") return "Minor priority / walking wounded.";
  return "Terminal Black category after confirmed non-breathing rule; not a treatment-priority override.";
}

function Admin() {
  const [a, setA] = useState<SavedAssessment[]>([]);
  const [r, setR] = useState<MethaneReport[]>([]);
  const [q, setQ] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const refresh = () => {
    setA(listAssessments());
    setR(listReports());
  };

  useEffect(() => { refresh(); }, []);

  const stats = useMemo(() => {
    const c = { RED: 0, YELLOW: 0, GREEN: 0, BLACK: 0 };
    a.forEach((x) => { c[x.result.classification]++; });
    return c;
  }, [a]);

  const filtered = a.filter((x) => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
  const max = Math.max(1, ...Object.values(stats));

  const removeAssessment = (id: string) => {
    deleteAssessment(id);
    if (selectedAssessmentId === id) setSelectedAssessmentId(null);
    refresh();
  };

  const removeReport = (id: string) => {
    deleteReport(id);
    if (selectedReportId === id) setSelectedReportId(null);
    refresh();
  };

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Database className="h-4 w-4" /> Local Records
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Incident Records & Analytics</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["RED", "YELLOW", "GREEN", "BLACK"] as const).map((c) => (
          <Card key={c} className={`p-4 ${COLOR[c]}`}>
            <div className="text-xs uppercase opacity-80">{c}</div>
            <div className="text-3xl font-bold">{stats[c]}</div>
          </Card>
        ))}
      </div>

      <Card className="glass p-5">
        <h2 className="font-semibold mb-3">Triage Distribution</h2>
        <div className="space-y-2">
          {(["RED", "YELLOW", "GREEN", "BLACK"] as const).map((c) => (
            <div key={c} className="flex items-center gap-3">
              <div className="w-16 text-xs font-semibold">{c}</div>
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${COLOR[c]}`} style={{ width: `${(stats[c] / max) * 100}%` }} />
              </div>
              <div className="w-10 text-right text-sm font-mono">{stats[c]}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold">Assessments ({a.length})</h2>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="max-w-xs" />
        </div>
        <div className="mt-4 space-y-2 divide-y divide-border">
          {filtered.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No records yet. <Link to="/triage" className="text-primary underline">Run an assessment</Link>.</p>}
          {filtered.map((x) => {
            const isSelected = selectedAssessmentId === x.id;
            return (
              <div key={x.id}>
                <div className="py-3 flex items-center gap-3 flex-wrap">
                  <Badge className={COLOR[x.result.classification]}>{x.result.classification}</Badge>
                  <div className="text-sm">{x.symptoms.victimType}</div>
                  <div className="text-xs text-muted-foreground">{formatMalaysiaTime(x.timestamp)}</div>
                  <div className="text-xs text-muted-foreground ml-auto">{x.result.fired.length} rules fired</div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedAssessmentId(isSelected ? null : x.id)}>
                    <Eye className="h-4 w-4 mr-1" /> {isSelected ? "Hide" : "View"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadFile(`triage-${x.id}.txt`, assessmentText(x), "text/plain")}>
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadPdf(`triage-${x.id}.pdf`, assessmentText(x))}>
                    <FileText className="h-4 w-4 mr-1" /> PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeAssessment(x.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
                {isSelected && (
                  <div className="py-3 pl-3 border-l-2 border-border bg-muted/20 space-y-2 text-sm">
                    <div className="grid md:grid-cols-2 gap-2">
                      <div><span className="font-semibold">Severity:</span> {x.result.severityScore}</div>
                      <div><span className="font-semibold">MCI:</span> {x.symptoms.isMCI ? "Yes" : "No"}</div>
                      <div><span className="font-semibold">Condition changed:</span> {x.symptoms.conditionChangedSinceLastCheck ? "Yes" : "No"}</div>
                      <div><span className="font-semibold">Other patients waiting:</span> {x.symptoms.otherPatientsWaiting ? "Yes" : "No"}</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Recommendations</div>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {(x.result.recommendations.length ? x.result.recommendations : ["No immediate actions queued."]).map((item, idx) => <li key={idx}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Matched Rules</div>
                      <div className="flex flex-wrap gap-1">
                        {x.result.fired.map((f) => <Badge key={f.id} variant="outline" className="font-mono text-xs">R{f.id}</Badge>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="glass p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileWarning className="h-4 w-4 text-triage-yellow" />
          <h2 className="font-semibold">METHANE Reports ({r.length})</h2>
        </div>
        <div className="space-y-2 divide-y divide-border">
          {r.length === 0 && <p className="text-sm text-muted-foreground py-4">No reports saved.</p>}
          {r.map((x) => {
            const isSelected = selectedReportId === x.id;
            return (
              <div key={x.id}>
                <div className="py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-semibold">{x.major || "M - Major Incident"}</div>
                    <div className="text-xs text-muted-foreground">{formatMalaysiaTime(x.timestamp)}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => setSelectedReportId(isSelected ? null : x.id)}>
                      <Eye className="h-4 w-4 mr-1" /> {isSelected ? "Hide" : "View"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadFile(`methane-${x.id}.txt`, reportText(x), "text/plain")}>
                      <Download className="h-4 w-4 mr-1" /> Export
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openMethanePrintView(x)}>
                      <FileText className="h-4 w-4 mr-1" /> PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeReport(x.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
                {isSelected && (
                  <div className="py-3 pl-3 border-l-2 border-border bg-muted/20 space-y-2 text-sm">
                    <div className="grid md:grid-cols-2 gap-2">
                      <div><span className="font-semibold">Location:</span> {x.location || "Not provided"}</div>
                      <div><span className="font-semibold">Type:</span> {x.type || "Not provided"}</div>
                      <div><span className="font-semibold">Hazards:</span> {x.hazards || "Not provided"}</div>
                      <div><span className="font-semibold">Access:</span> {x.access || "Not provided"}</div>
                      <div><span className="font-semibold">Casualties:</span> {x.casualties || "Not provided"}</div>
                      <div><span className="font-semibold">Services:</span> {x.services || "Not provided"}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
