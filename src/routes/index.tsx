import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  ClipboardList,
  Shield,
  Sparkles,
  ArrowRight,
  Activity,
  CheckCircle2,
  BarChart3,
  Users,
  MessageSquare,
  ListChecks,
  FileText,
  Layers,
  Gauge,
} from "lucide-react";
import { AppNav } from "@/components/layout/AppNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProjectRx AI — Diagnose, Simulate, Recover your projects" },
      {
        name: "description",
        content:
          "AI-powered Project Recovery & Decision Support Platform. Turn messy project updates into explainable recovery strategies.",
      },
      { property: "og:title", content: "ProjectRx AI — Project Recovery Platform" },
      {
        property: "og:description",
        content:
          "Diagnose project health, simulate recovery scenarios, and generate professional recovery plans with Explainable AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: ClipboardList, title: "Input Project Data", desc: "Paste project notes or use quick sliders." },
  { icon: Brain, title: "AI Diagnosis", desc: "AI extracts risks and analyzes project health." },
  { icon: Sparkles, title: "Scenario Simulation", desc: "Test recovery decisions before implementing them." },
  { icon: Shield, title: "Recovery Plan", desc: "Receive an actionable recovery strategy." },
];

const features = [
  { icon: Activity, title: "AI Project Diagnosis", desc: "Deep analysis grounded in PMBOK best practices." },
  { icon: Gauge, title: "Project Recovery Index", desc: "A single 0–100 score for project health." },
  { icon: Sparkles, title: "Scenario Simulator", desc: "Test 'what-if' recovery moves in seconds." },
  { icon: BarChart3, title: "Confidence Score", desc: "Know how reliable each recommendation is." },
  { icon: Layers, title: "Explainable AI", desc: "Every insight ships with its reasoning." },
  { icon: FileText, title: "Executive Summary", desc: "Board-ready reports, generated instantly." },
  { icon: MessageSquare, title: "Stakeholder Email", desc: "Professional, tone-matched communications." },
  { icon: ListChecks, title: "Recovery Checklist", desc: "Actionable steps with live progress tracking." },
  { icon: CheckCircle2, title: "PMBOK Risk Classification", desc: "Standardized risk categories." },
  { icon: BarChart3, title: "Responsive Dashboard", desc: "Beautiful analytics on any device." },
];

const audiences = [
  "Project Managers",
  "Startup Founders",
  "NGOs",
  "Student Teams",
  "Event Managers",
  "Small Businesses",
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
          <div className="absolute top-40 right-0 h-[300px] w-[400px] rounded-full bg-warning/15 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              Powered by Explainable AI
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl">
              <span className="gradient-text">ProjectRx AI</span>
            </h1>
            <p className="mt-4 text-xl text-foreground/90">
              AI-powered Project Recovery & Decision Support Platform
            </p>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Transform messy project updates into intelligent recovery strategies using Explainable AI.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gradient-primary glow-primary text-white border-0">
                <Link to="/analyze">
                  Start Diagnosis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how">View Demo</a>
              </Button>
            </div>
          </div>

          {/* Hero mock dashboard */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="glass rounded-2xl p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border/60 bg-card/60 p-5">
                  <div className="text-xs text-muted-foreground">Recovery Index</div>
                  <div className="mt-1 text-4xl font-bold text-success">82</div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-success" style={{ width: "82%" }} />
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/60 p-5">
                  <div className="text-xs text-muted-foreground">Confidence</div>
                  <div className="mt-1 text-4xl font-bold gradient-text">87%</div>
                  <p className="mt-2 text-xs text-muted-foreground">Sufficient information provided.</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/60 p-5">
                  <div className="text-xs text-muted-foreground">Risk Level</div>
                  <div className="mt-1 text-4xl font-bold text-warning">Medium</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Schedule", "Budget", "Stakeholder"].map((r) => (
                      <span key={r} className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] text-warning">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">From messy notes to a defensible recovery plan in minutes.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative rounded-2xl border border-border/60 bg-card/60 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:glow-primary"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl gradient-primary text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-xs text-muted-foreground">Step {i + 1}</div>
              <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything a PM needs to recover a project</h2>
            <p className="mt-3 text-muted-foreground">One platform. Ten focused capabilities.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40">
                <f.icon className="h-5 w-5 text-primary" />
                <div className="mt-3 text-sm font-semibold">{f.title}</div>
                <p className="mt-1.5 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Built for teams that need to move fast</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {audiences.map((a) => (
            <div key={a} className="glass flex items-center gap-3 rounded-xl p-5">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">{a}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-background to-warning/10 p-10 text-center sm:p-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to rescue your project?</h2>
          <p className="mt-3 text-muted-foreground">
            Run your first diagnosis in under two minutes. No credit card required.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="gradient-primary glow-primary text-white border-0">
              <Link to="/analyze">
                Start Free Diagnosis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
