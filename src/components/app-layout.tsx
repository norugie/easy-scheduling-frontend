import { CalendarDays, LogOut, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export function AppLayout({
  children,
  path,
  username,
  onNavigate,
  onLogout,
}: {
  children: React.ReactNode;
  path: string;
  username: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="no-print border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm text-muted-foreground">Easy Scheduling</p>
            <h1 className="text-xl font-semibold">Scheduling workspace</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <NavButton
              active={path === "/" || path === "/calendar" || path.startsWith("/days/")}
              onClick={() => onNavigate("/calendar")}
            >
              <CalendarDays className="size-4" />
              Calendar
            </NavButton>
            <NavButton
              active={path === "/substitutes"}
              onClick={() => onNavigate("/substitutes")}
            >
              <Users className="size-4" />
              Subs
            </NavButton>
            <NavButton
              active={path === "/references"}
              onClick={() => onNavigate("/references")}
            >
              <MapPin className="size-4" />
              Places
            </NavButton>
            <ThemeToggle />
            <Button type="button" variant="outline" onClick={onLogout}>
              <LogOut className="size-4" />
              {username}
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

function NavButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "ghost"}
      className={cn(active && "shadow-sm")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
