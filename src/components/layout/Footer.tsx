export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-lg font-semibold">
              <span className="gradient-text">ProjectRx AI</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Diagnose. Simulate. Recover.</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with TanStack Start + Lovable AI · © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
