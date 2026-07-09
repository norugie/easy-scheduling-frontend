import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth";
import { ApiError } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(username, password);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not log in. Check the API connection.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <form
        onSubmit={onSubmit}
        className="grid w-full max-w-sm gap-5 rounded-lg border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Easy Scheduling</p>
            <h1 className="text-xl font-semibold">Sign in</h1>
          </div>
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <label className="grid gap-2 text-sm font-medium">
          Username
          <input
            className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Password
          <input
            className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </label>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
