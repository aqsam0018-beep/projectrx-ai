import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, History, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppNav() {
  const { location } = useRouterState();
  const path = location.pathname;
  const items = [
    { to: "/", label: "Home", icon: Sparkles },
    { to: "/analyze", label: "Analyze", icon: Activity },
    { to: "/history", label: "History", icon: History },
    { to: "/settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary glow-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">ProjectRx AI</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Diagnose · Simulate · Recover
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {items.map((it) => {
            const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
