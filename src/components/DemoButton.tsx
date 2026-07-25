import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { analyzeProject } from "@/lib/analyze.functions";
import { saveRecord } from "@/lib/history";
import { SAMPLE_PROJECT } from "@/lib/sample-project";

const STEPS = [
  "Loading sample project...",
  "Extracting risks & signals...",
  "Calculating Recovery Index...",
  "Generating recommendations...",
  "Preparing your dashboard...",
];

export function DemoButton() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeProject);
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  async function runDemo() {
    setLoading(true);
    setStepIdx(0);
    const iv = setInterval(() => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1)), 900);
    try {
      const result = await analyze({ data: SAMPLE_PROJECT });
      const id = crypto.randomUUID();
      saveRecord({ id, createdAt: new Date().toISOString(), input: SAMPLE_PROJECT, result });
      toast.success("Live demo ready");
      navigate({ to: "/results/$id", params: { id } });
    } catch (e) {
      console.error(e);
      toast.error("Demo failed. Please try again.");
    } finally {
      clearInterval(iv);
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        size="lg"
        variant="outline"
        onClick={runDemo}
        disabled={loading}
        className="transition-all hover:border-primary/60 hover:bg-primary/10 hover:-translate-y-0.5"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running live demo…</>
        ) : (
          <><Play className="mr-2 h-4 w-4" /> View Live Demo</>
        )}
      </Button>

      {loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass mx-4 w-full max-w-md rounded-2xl p-8 text-center animate-scale-in">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary glow-primary">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">Running ProjectRx AI live demo</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Analyzing <span className="text-foreground">{SAMPLE_PROJECT.projectName}</span>
            </p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full gradient-primary transition-all duration-700 ease-out"
                style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{STEPS[stepIdx]}</p>
          </div>
        </div>
      )}
    </>
  );
}
