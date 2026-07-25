import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sparkles, Brain, Wand2, ClipboardPaste, FileText } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeProject } from "@/lib/analyze.functions";
import { saveRecord } from "@/lib/history";
import { SAMPLE_PROJECT } from "@/lib/sample-project";
import type { ProjectInput, ProjectType, Priority } from "@/types/project";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "New Analysis · ProjectRx AI" },
      { name: "description", content: "Diagnose a project. Paste notes or use quick indicators to generate a recovery plan." },
      { property: "og:title", content: "New Analysis · ProjectRx AI" },
      { property: "og:description", content: "Generate an AI-powered project recovery plan in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

const PROJECT_TYPES: ProjectType[] = [
  "Software", "Construction", "NGO", "Research", "Marketing", "Event", "Business", "Education",
];

const LOADING_MESSAGES = [
  "Reading project information...",
  "Identifying project risks...",
  "Calculating Project Recovery Index...",
  "Evaluating recovery options...",
  "Preparing recommendations...",
  "Generating stakeholder communication...",
  "Finalizing report...",
];

function AnalyzePage() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeProject);

  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("Software");
  const [projectDump, setProjectDump] = useState("");
  const [progress, setProgress] = useState(50);
  const [budget, setBudget] = useState(60);
  const [timeline, setTimeline] = useState(70);
  const [stress, setStress] = useState(55);
  const [satisfaction, setSatisfaction] = useState(60);
  const [openRisks, setOpenRisks] = useState(4);
  const [priority, setPriority] = useState<Priority>("High");

  const [loading, setLoading] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);

  async function onSubmit() {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    if (!projectDump.trim() && progress === 0 && budget === 0) {
      toast.error("Please provide some project context");
      return;
    }
    setLoading(true);
    setMsgIdx(0);
    const iv = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1400);
    try {
      const input: ProjectInput = {
        projectName: projectName.trim(),
        projectType,
        projectDump: projectDump.trim(),
        indicators: {
          progress,
          budgetUtilization: budget,
          timelineCompletion: timeline,
          teamStress: stress,
          stakeholderSatisfaction: satisfaction,
          openRisks,
          priority,
        },
      };
      const result = await analyze({ data: input });
      const id = crypto.randomUUID();
      saveRecord({ id, createdAt: new Date().toISOString(), input, result });
      toast.success("Diagnosis complete");
      navigate({ to: "/results/$id", params: { id } });
    } catch (e) {
      console.error(e);
      toast.error("Analysis failed. Please try again.");
    } finally {
      clearInterval(iv);
      setLoading(false);
    }
  }

  function loadSample() {
    setProjectName(SAMPLE_PROJECT.projectName);
    setProjectType(SAMPLE_PROJECT.projectType);
    setProjectDump(SAMPLE_PROJECT.projectDump);
    const i = SAMPLE_PROJECT.indicators;
    setProgress(i.progress);
    setBudget(i.budgetUtilization);
    setTimeline(i.timelineCompletion);
    setStress(i.teamStress);
    setSatisfaction(i.stakeholderSatisfaction);
    setOpenRisks(i.openRisks);
    setPriority(i.priority);
    toast.success("Sample project loaded");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">New Project Diagnosis</h1>
            <p className="mt-2 text-muted-foreground">
              Give ProjectRx AI as much context as you can. Everything runs on your device and via a secure server call.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadSample}
            disabled={loading}
            className="transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10"
          >
            <FileText className="mr-2 h-4 w-4" /> Load Sample Project
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: top + dump + indicators */}
          <div className="space-y-6 lg:col-span-2">
            {/* Project meta */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Project details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pname">Project name</Label>
                  <Input
                    id="pname"
                    placeholder="e.g. Mobile App Launch"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project type</Label>
                  <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Smart dump */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Smart Project Dump</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste meeting notes, email conversations, WhatsApp messages, Slack updates or project summaries.
              </p>
              <Textarea
                className="mt-4 min-h-[220px] resize-y"
                placeholder="Paste anything project-related here..."
                value={projectDump}
                onChange={(e) => setProjectDump(e.target.value)}
                maxLength={20000}
              />
              <div className="mt-2 text-right text-xs text-muted-foreground">
                {projectDump.length.toLocaleString()} / 20,000
              </div>
            </div>

            {/* Indicators */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Quick Project Indicators</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Adjust the sliders that best describe today's state.</p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <SliderRow label="Project Progress" value={progress} onChange={setProgress} unit="%" />
                <SliderRow label="Budget Utilization" value={budget} onChange={setBudget} unit="%" />
                <SliderRow label="Timeline Completion" value={timeline} onChange={setTimeline} unit="%" />
                <SliderRow label="Team Stress" value={stress} onChange={setStress} leftLabel="Low" rightLabel="High" />
                <SliderRow label="Stakeholder Satisfaction" value={satisfaction} onChange={setSatisfaction} leftLabel="Low" rightLabel="High" />
                <SliderRow label="Open Risks" value={openRisks} onChange={setOpenRisks} min={0} max={20} step={1} />

                <div className="space-y-2 sm:col-span-2">
                  <Label>Project Priority</Label>
                  <div className="flex gap-2">
                    {(["Low","Medium","High"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          priority === p
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: submit summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4" /> Ready to analyze
                </div>
                <p className="mt-3 text-sm">
                  ProjectRx AI will produce a Recovery Index, root cause, prioritized recommendations, a checklist, executive summary and a stakeholder email.
                </p>
                <Button
                  onClick={onSubmit}
                  disabled={loading}
                  className="mt-5 h-12 w-full gradient-primary glow-primary text-base text-white border-0 transition-transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Analyze Project</>
                  )}
                </Button>
                {loading && (
                  <div className="mt-4 space-y-3">
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 gradient-primary transition-[width] duration-1000 ease-out"
                        style={{ width: `${((msgIdx + 1) / LOADING_MESSAGES.length) * 100}%` }}
                      />
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span key={msgIdx} className="animate-fade-in">{LOADING_MESSAGES[msgIdx]}</span>
                    </div>
                  </div>
                )}
                <p className="mt-4 text-[11px] text-muted-foreground">
                  ProjectRx AI provides AI-generated recommendations to support project managers. Final decisions should always be made using professional judgment.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SliderRow({
  label, value, onChange, min = 0, max = 100, step = 1, unit, leftLabel, rightLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  leftLabel?: string;
  rightLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-semibold text-primary">
          {value}{unit ?? ""}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{leftLabel}</span><span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
