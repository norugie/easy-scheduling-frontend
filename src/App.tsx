import { Button } from "@/components/ui/button";

const stats = [
  { label: "Today", value: "0", detail: "appointments" },
  { label: "Requests", value: "0", detail: "pending" },
  { label: "Team", value: "0", detail: "members" },
];

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Easy Scheduling</p>
            <h1 className="text-xl font-semibold">Workspace</h1>
          </div>
          <Button>New schedule</Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <article className="rounded-lg border bg-card p-4" key={stat.label}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-semibold">{stat.value}</span>
                <span className="pb-1 text-sm text-muted-foreground">
                  {stat.detail}
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="font-medium">Upcoming</h2>
          </div>
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No schedule items yet.
          </div>
        </section>
      </main>
    </div>
  );
}
