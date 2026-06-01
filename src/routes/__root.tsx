import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Timer, Layers, ListTodo, Download } from "lucide-react";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useTimerStore } from "@/stores/timerStore";
import { formatTime } from "@/lib/utils";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { NotFound } from "@/components/ui/NotFound";

export function RootLayout() {
  const { status, secondsLeft, mode } = useTimerStore();
  const isRunning = status === "running";
  const { isInstallable, install } = usePWAInstall();

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <nav className="border-b border-outline/20 p-4 flex justify-between items-center bg-surface sticky top-0 z-50">
        <div className="flex gap-6 items-center">
          <Link
            to="/"
            className="text-xl font-headline font-bold text-primary tracking-tight"
          >
            POMOTASK
          </Link>
          <div className="hidden md:flex gap-4 font-label text-sm uppercase tracking-wider">
            <Link
              to="/"
              className="hover:text-primary transition-colors [&.active]:text-primary"
            >
              Timer
            </Link>
            <Link
              to="/projects"
              className="hover:text-primary transition-colors [&.active]:text-primary"
            >
              Projects
            </Link>
            <Link
              to="/tasks"
              className="hover:text-primary transition-colors [&.active]:text-primary"
            >
              Tasks
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isInstallable && (
            <button
              onClick={install}
              className="hidden sm:flex items-center gap-2 bg-secondary/10 border border-secondary/30 px-3 py-1.5 rounded-full text-secondary hover:bg-secondary/20 transition-all text-xs font-label uppercase tracking-widest"
              title="Install App"
            >
              <Download size={14} />
              <span>Install</span>
            </button>
          )}

          {isRunning && (
            <div className="hidden sm:flex items-center gap-3 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,45,120,0.2)]">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-label text-xs font-bold text-primary">
                {mode.toUpperCase()}: {formatTime(secondsLeft)}
              </span>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-6xl mb-20 md:mb-8">
        <Outlet />
      </main>
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline/20 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/"
            className="flex flex-col items-center gap-1 text-on_surface_variant transition-colors [&.active]:text-primary"
          >
            <Timer size={20} />
            <span className="text-[10px] font-label uppercase tracking-tighter">
              Timer
            </span>
          </Link>
          <Link
            to="/projects"
            className="flex flex-col items-center gap-1 text-on_surface_variant transition-colors [&.active]:text-primary"
          >
            <Layers size={20} />
            <span className="text-[10px] font-label uppercase tracking-tighter">
              Projects
            </span>
          </Link>
          <Link
            to="/tasks"
            className="flex flex-col items-center gap-1 text-on_surface_variant transition-colors [&.active]:text-primary"
          >
            <ListTodo size={20} />
            <span className="text-[10px] font-label uppercase tracking-tighter">
              Tasks
            </span>
          </Link>
        </div>
      </footer>
      {/* <TanStackRouterDevtools /> */}
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
