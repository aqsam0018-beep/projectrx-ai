import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ArrowLeft, Copy, Download, Loader2, Mail, ListChecks, Sparkles, ShieldAlert, Lightbulb, Info, Wand2, FileText,
} from "lucide-react";
import { getRecord, updateRecord } from "@/lib/history";
import type { HistoryRecord, AnalysisResult } from "@/types/project";
import { useServerFn } from "@tanstack/react-start";
import { analyzeProject } from "@/lib/analyze.functions";
import { downloadPdfReport } from "@/lib/pdf-report";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

export const Route = createFileRoute("/results/$id")({
  head: () => ({
    meta: [
      { title: "Analysis Results · ProjectRx AI" },
      { name: "description", content: "Project Recovery Index, risks, recommendations and recovery plan." },
      { property: "og:title", content: "Analysis Results · ProjectRx AI" },
      { property: "og:description", content: "Explainable AI analysis of your project health." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultsPage,
});

const SCENARIOS = [
  "Extend Deadline",
  "Reduce Scope",
  "Increase Budget",
  "Add Team Members",
  "Improve Communication",
  "Freeze New Requirements",
];

function ResultsPage() {
  const { id } = useParams({ from: "/results/$id" });
  const navigate = useNavigate();
  const [record, setRecord] = useState<HistoryRecord | null>(null);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [simLoading, setSimLoading] = useState<string | null>(null);
  const analyze = useServerFn(analyzeProject);

  useEffect(() => {
    const r = getRecord(id);
    if (!r) {
      toast.error("Analysis not found");
      navigate({ to: "/analyze" });
      return;
    }
    setRecord(r);
  }, [id, navigate]);

  const result = record?.result;

  const indexColor = useMemo(() => {
    if (!result) return "text-muted-foreground";
    if (result.projectRecoveryIndex >= 70) return "text-success";
    if (result.projectRecoveryIndex >= 45) return "text-warning";
    return "text-destructive";
  }, [result]);

  if (!record || !result) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const checklistProgress = Math.round((checkedCount / Math.max(1, result.checklist.length)) * 100);

  async function runScenario(scenario: string) {
    if (!record) return;
    setSimLoading(scenario);
    setPrevIndex(record.result.projectRecoveryIndex);
    try {
      const newResult = await analyze({ data: { ...record.input, scenario } });
      const updated: HistoryRecord = { ...record, result: newResult };
      updateRecord(record.id, { result: newResult });
      setRecord(updated);
      toast.success(`Simulated: ${scenario}`);
    } catch (e) {
      console.error(e);
      toast.error("Simulation failed");
    } finally {
      setSimLoading(null);
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  }

  function downloadPdf() {
    try {
      downloadPdfReport(record!);
      toast.success("PDF report downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF");
    }
  }

  function downloadMarkdown() {
    const md = buildReportMarkdown(record!);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record!.input.projectName.replace(/\s+/g, "_")}_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const diff = prevIndex != null ? result.projectRecoveryIndex - prevIndex : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Top */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/analyze" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> New analysis
            </Link>
            <h1 className="text-3xl font-bold sm:text-4xl">{record.input.projectName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(record.createdAt).toLocaleString()} · {record.input.projectType}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => copy(result.executiveSummary, "Executive summary")}
              className="transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Executive Summary
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                copy(
                  `Subject: ${result.stakeholderEmail.subject}\n\n${result.stakeholderEmail.body}`,
                  "Stakeholder email",
                )
              }
              className="transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10"
            >
              <Mail className="mr-2 h-4 w-4" /> Copy Stakeholder Email
            </Button>
            <Button
              variant="ghost"
              onClick={downloadMarkdown}
              className="transition-all hover:-translate-y-0.5"
              title="Download Markdown"
            >
              <FileText className="mr-2 h-4 w-4" /> .md
            </Button>
            <Button
              className="gradient-primary glow-primary text-white border-0 transition-all hover:-translate-y-0.5"
              onClick={downloadPdf}
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF Report
            </Button>
          </div>
        </div>

        {/* Top grid */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {/* Recovery Index gauge */}
          <div className="glass rounded-2xl p-6 transition-all hover:border-primary/40 hover:-translate-y-0.5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Project Recovery Index</div>
            <div className="mt-4 flex items-center gap-6">
              <Gauge value={result.projectRecoveryIndex} />
              <div>
                <div className={`text-5xl font-bold ${indexColor} tabular-nums`}>
                  <AnimatedNumber value={result.projectRecoveryIndex} />
                </div>
                <div className="mt-1 text-sm font-medium">{result.status}</div>
                {prevIndex != null && (
                  <div className={`mt-2 text-xs ${diff >= 0 ? "text-success" : "text-destructive"}`}>
                    {diff >= 0 ? "▲" : "▼"} {Math.abs(diff)} vs previous ({prevIndex})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="glass rounded-2xl p-6 transition-all hover:border-primary/40 hover:-translate-y-0.5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Confidence Score</div>
            <div className="mt-4 text-5xl font-bold gradient-text tabular-nums">
              <AnimatedNumber value={result.confidence} suffix="%" />
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full gradient-primary transition-[width] duration-1000 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, result.confidence))}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {result.confidence >= 60 ? "Sufficient project information available." : "More project data required."}
            </p>
            {result.confidence < 60 && (
              <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                Additional project information is recommended to improve analysis accuracy.
              </div>
            )}
          </div>

          {/* Risk categories */}
          <div className="glass rounded-2xl p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Risk Categories</div>
            <div className="mt-3 flex items-center gap-2">
              <ShieldAlert className={`h-5 w-5 ${indexColor}`} />
              <span className="text-lg font-semibold">{result.riskLevel} risk</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.riskCategories.length === 0 && (
                <span className="text-sm text-muted-foreground">No categories flagged.</span>
              )}
              {result.riskCategories.map((c) => (
                <span key={c} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Root cause + Simulator */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold">Root Cause Analysis</h3>
            </div>
            <ul className="mt-4 space-y-2">
              {(Array.isArray(result.rootCause) ? result.rootCause : [String(result.rootCause)]).slice(0, 4).map((c, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-border/60 bg-card/60 p-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Simulator */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold">What-If Simulator</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Simulate recovery strategies before implementing them.
            </p>
            <div className="mt-4 grid gap-2">
              {SCENARIOS.map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  disabled={simLoading != null}
                  onClick={() => runScenario(s)}
                  className="justify-start"
                >
                  {simLoading === s ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-3 w-3 text-primary" />
                  )}
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 glass rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            <h3 className="text-lg font-semibold">Recommendations</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {result.recommendations.map((r, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary/20 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold">{r.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{r.reason}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    r.priority === "High" ? "bg-destructive/15 text-destructive"
                      : r.priority === "Medium" ? "bg-warning/15 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}>{r.priority}</span>
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  <span className="text-foreground/80">Impact: </span>{r.expectedImpact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist + Lessons */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-success" />
                <h3 className="text-lg font-semibold">Recovery Checklist</h3>
              </div>
              <span className="text-sm text-muted-foreground">{checklistProgress}%</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-success transition-all" style={{ width: `${checklistProgress}%` }} />
            </div>
            <ul className="mt-4 space-y-2">
              {result.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/60 p-3">
                  <Checkbox
                    checked={!!checked[i]}
                    onCheckedChange={(v) => setChecked({ ...checked, [i]: !!v })}
                    className="mt-0.5"
                  />
                  <span className={`text-sm ${checked[i] ? "text-muted-foreground line-through" : ""}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold">Lessons Learned</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {result.lessonsLearned.map((l, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span><span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Executive summary + email */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Executive Summary</h3>
              <Button size="sm" variant="ghost" onClick={() => copy(result.executiveSummary, "Executive summary")}>
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {result.executiveSummary}
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold">Stakeholder Email</h3>
              </div>
              <Button
                size="sm" variant="ghost"
                onClick={() => copy(`Subject: ${result.stakeholderEmail.subject}\n\n${result.stakeholderEmail.body}`, "Email")}
              >
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            </div>
            <div className="mt-4 rounded-lg border border-border/60 bg-card/60 p-4">
              <div className="text-xs text-muted-foreground">Subject</div>
              <div className="font-medium">{result.stakeholderEmail.subject}</div>
              <div className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">
                {result.stakeholderEmail.body}
              </div>
            </div>
          </div>
        </div>

        {/* Assumptions / missing */}
        {(result.assumptions.length > 0 || result.missingInformation.length > 0) && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {result.assumptions.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold">Assumptions</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {result.assumptions.map((a, i) => <li key={i}>• {a}</li>)}
                </ul>
              </div>
            )}
            {result.missingInformation.length > 0 && (
              <div className="glass rounded-2xl border border-warning/30 p-6">
                <h3 className="text-lg font-semibold text-warning">Missing Information</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {result.missingInformation.map((a, i) => <li key={i}>• {a}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          ProjectRx AI provides AI-generated recommendations to support project managers. Final decisions should always be made using professional judgment.
        </p>
      </main>

      <Footer />
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const R = 46, C = 2 * Math.PI * R;
  const offset = C - (clamped / 100) * C;
  const stroke = clamped >= 70 ? "oklch(0.72 0.19 145)" : clamped >= 45 ? "oklch(0.78 0.17 70)" : "oklch(0.62 0.22 25)";
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={R} stroke="oklch(0.28 0.02 275)" strokeWidth="10" fill="none" />
      <circle
        cx="60" cy="60" r={R}
        stroke={stroke} strokeWidth="10" fill="none"
        strokeDasharray={C} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 700ms ease" }}
      />
    </svg>
  );
}

function buildReportMarkdown(rec: HistoryRecord): string {
  const r: AnalysisResult = rec.result;
  return `# ${rec.input.projectName} — Recovery Report

**Date:** ${new Date(rec.createdAt).toLocaleString()}
**Project Type:** ${rec.input.projectType}

## Project Recovery Index
**${r.projectRecoveryIndex} / 100** — ${r.status}

## Confidence Score
${r.confidence}%

## Risk Categories (${r.riskLevel})
${r.riskCategories.map((c) => `- ${c}`).join("\n")}

## Root Cause Analysis
${(Array.isArray(r.rootCause) ? r.rootCause : [r.rootCause]).map((c) => `- ${c}`).join("\n")}

## Recommendations
${r.recommendations.map((rec, i) => `**${i + 1}. ${rec.title}** _(Priority: ${rec.priority})_
- Reason: ${rec.reason}
- Expected impact: ${rec.expectedImpact}`).join("\n\n")}

## Recovery Checklist
${r.checklist.map((c) => `- [ ] ${c}`).join("\n")}

## Executive Summary
${r.executiveSummary}

## Stakeholder Email
**Subject:** ${r.stakeholderEmail.subject}

${r.stakeholderEmail.body}

## Lessons Learned
${r.lessonsLearned.map((l) => `- ${l}`).join("\n")}

${r.assumptions.length ? `## Assumptions\n${r.assumptions.map((a) => `- ${a}`).join("\n")}\n` : ""}
${r.missingInformation.length ? `## Missing Information\n${r.missingInformation.map((a) => `- ${a}`).join("\n")}\n` : ""}

---
_ProjectRx AI provides AI-generated recommendations to support project managers. Final decisions should always be made using professional judgment._
`;
}
