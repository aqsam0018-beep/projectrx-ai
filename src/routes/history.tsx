import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { deleteRecord, getHistory } from "@/lib/history";
import type { HistoryRecord } from "@/types/project";
import { Eye, RotateCcw, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History · ProjectRx AI" },
      { name: "description", content: "Your previous project diagnoses, stored locally on your device." },
      { property: "og:title", content: "History · ProjectRx AI" },
      { property: "og:description", content: "Review, re-run and manage your ProjectRx AI analyses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => { setRecords(getHistory()); }, []);

  function del(id: string) {
    deleteRecord(id);
    setRecords(getHistory());
    toast.success("Deleted");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">History</h1>
            <p className="mt-2 text-muted-foreground">Stored locally on your device.</p>
          </div>
          <Button asChild className="gradient-primary text-white border-0">
            <Link to="/analyze"><Sparkles className="mr-2 h-4 w-4" /> New analysis</Link>
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {records.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
              No analyses yet. Start your first diagnosis.
            </div>
          )}
          {records.map((r) => (
            <div key={r.id} className="glass flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString()} · {r.input.projectType}
                </div>
                <div className="text-lg font-semibold">{r.input.projectName}</div>
                <div className="mt-1 flex items-center gap-3 text-xs">
                  <span className={`rounded-full px-2 py-0.5 ${
                    r.result.projectRecoveryIndex >= 70 ? "bg-success/15 text-success"
                    : r.result.projectRecoveryIndex >= 45 ? "bg-warning/15 text-warning"
                    : "bg-destructive/15 text-destructive"
                  }`}>Index {r.result.projectRecoveryIndex}</span>
                  <span className="text-muted-foreground">Risk: {r.result.riskLevel}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate({ to: "/results/$id", params: { id: r.id } })}>
                  <Eye className="mr-1 h-3 w-3" /> View
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate({ to: "/analyze" })}>
                  <RotateCcw className="mr-1 h-3 w-3" /> Re-analyze
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => del(r.id)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
