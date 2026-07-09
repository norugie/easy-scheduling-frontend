import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "@/auth";
import { AppLayout } from "@/components/app-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { CalendarPage } from "@/pages/calendar-page";
import { LoginPage } from "@/pages/login-page";
import { ReferencesPage } from "@/pages/references-page";
import { SubstitutesPage } from "@/pages/substitutes-page";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { loading, user, logout } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPath: string) => {
    if (window.location.pathname === nextPath) {
      setPath(nextPath);
      return;
    }

    window.history.pushState(null, "", nextPath);
    setPath(nextPath);
  };

  const route = useMemo(() => parseRoute(path), [path]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <AppLayout
      path={path}
      username={user.username}
      onNavigate={navigate}
      onLogout={logout}
    >
      {route.name === "day" ? (
        <CalendarPage navigate={navigate} initialSelectedDate={route.date} />
      ) : route.name === "substitutes" ? (
        <SubstitutesPage />
      ) : route.name === "references" ? (
        <ReferencesPage />
      ) : (
        <CalendarPage navigate={navigate} />
      )}
    </AppLayout>
  );
}

function parseRoute(path: string) {
  const dayMatch = path.match(/^\/days\/(\d{4}-\d{2}-\d{2})$/);
  if (dayMatch) return { name: "day" as const, date: dayMatch[1] };
  if (path === "/substitutes") return { name: "substitutes" as const };
  if (path === "/references") return { name: "references" as const };
  return { name: "calendar" as const };
}
