import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { clearHistory } from "@/lib/history";
import { toast } from "sonner";
import { Trash2, Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · ProjectRx AI" },
      { name: "description", content: "Manage appearance, history and API preferences for ProjectRx AI." },
      { property: "og:title", content: "Settings · ProjectRx AI" },
      { property: "og:description", content: "Configure ProjectRx AI to fit your workflow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(true);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("projectrx.theme");
    const isDark = savedTheme !== "light";
    setDark(isDark);
    applyTheme(isDark);
    setApiKey(localStorage.getItem("projectrx.geminiKey") ?? "");
  }, []);

  function applyTheme(isDark: boolean) {
    const root = document.documentElement;
    if (isDark) root.classList.remove("light");
    else root.classList.add("light");
  }

  function toggleTheme(v: boolean) {
    setDark(v);
    applyTheme(v);
    localStorage.setItem("projectrx.theme", v ? "dark" : "light");
  }

  function saveKey() {
    localStorage.setItem("projectrx.geminiKey", apiKey);
    toast.success("API key saved locally");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">Configure your ProjectRx AI experience.</p>

        <div className="mt-8 space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Appearance
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Toggle between dark and light mode.</p>
              </div>
              <Switch checked={dark} onCheckedChange={toggleTheme} />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="font-semibold">Gemini API Key (development only)</div>
            <p className="mt-1 text-sm text-muted-foreground">
              For local development only. Production uses the secure Lovable AI Gateway on the server.
            </p>
            <div className="mt-4 space-y-2">
              <Label htmlFor="key">Gemini API Key</Label>
              <div className="flex gap-2">
                <Input id="key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AI..." />
                <Button onClick={saveKey}>Save</Button>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="font-semibold">Clear history</div>
            <p className="mt-1 text-sm text-muted-foreground">Remove all locally stored analyses. This cannot be undone.</p>
            <Button
              variant="outline"
              className="mt-4 text-destructive hover:text-destructive"
              onClick={() => { clearHistory(); toast.success("History cleared"); }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear all history
            </Button>
          </div>

          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">App Version</div>
            <div className="mt-1">ProjectRx AI · v1.0.0</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
