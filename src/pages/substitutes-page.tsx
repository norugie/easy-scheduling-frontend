import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalloutStatusButtons } from "@/components/callout-status-buttons";
import { api, type CalloutStatus, type Substitute } from "@/lib/api";
import { todayDateString } from "@/lib/date";
import { cn } from "@/lib/utils";

const emptySubstitute = {
  name: "",
  email: "",
  phoneNumber: "",
  cellPhone: "",
  active: true,
};

export function SubstitutesPage() {
  const [date, setDate] = useState(todayDateString());
  const [substitutes, setSubstitutes] = useState<Substitute[]>([]);
  const [statuses, setStatuses] = useState(new Map<number, CalloutStatus>());
  const [form, setForm] = useState(emptySubstitute);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [subs, callouts] = await Promise.all([api.substitutes(), api.callouts(date)]);
      setSubstitutes(subs);
      setStatuses(
        new Map(callouts.map((item) => [item.substitute.id, item.status])),
      );
    } catch {
      setError("Could not load substitutes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [date]);

  async function createSubstitute(event: React.FormEvent) {
    event.preventDefault();
    await api.createSubstitute(toSubstitutePayload(form));
    setForm(emptySubstitute);
    await load();
  }

  async function updateCallout(id: number, status: CalloutStatus) {
    setStatuses((current) => new Map(current).set(id, status));
    await api.updateCallout(date, id, { status });
    await load();
  }

  const sortedSubstitutes = useMemo(
    () =>
      [...substitutes].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    [substitutes],
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Daily callout menu</p>
          <h2 className="text-2xl font-semibold">Substitutes</h2>
        </div>
        <label className="grid gap-1 text-sm font-medium">
          Callout date
          <input
            className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <form
        onSubmit={createSubstitute}
        className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]"
      >
        <input
          className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <input
          className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
          placeholder="Phone"
          value={form.phoneNumber}
          onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
        />
        <input
          className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
          placeholder="Cell"
          value={form.cellPhone}
          onChange={(event) => setForm({ ...form, cellPhone: event.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm({ ...form, active: event.target.checked })}
          />
          Active
        </label>
        <Button type="submit">
          <Plus className="size-4" />
          Add
        </Button>
      </form>

      {loading ? <p className="text-sm text-muted-foreground">Loading substitutes...</p> : null}

      <div className="grid gap-2">
        {sortedSubstitutes.map((substitute) => (
          <SubstituteRow
            key={substitute.id}
            substitute={substitute}
            status={statuses.get(substitute.id) ?? "pending"}
            onChangeStatus={(status) => updateCallout(substitute.id, status)}
            onChange={load}
          />
        ))}
      </div>
    </div>
  );
}

function SubstituteRow({
  substitute,
  status,
  onChangeStatus,
  onChange,
}: {
  substitute: Substitute;
  status: CalloutStatus;
  onChangeStatus: (status: CalloutStatus) => void;
  onChange: () => Promise<void>;
}) {
  const [draft, setDraft] = useState({
    name: substitute.name,
    email: substitute.email ?? "",
    phoneNumber: substitute.phoneNumber ?? "",
    cellPhone: substitute.cellPhone ?? "",
    active: substitute.active,
  });

  async function save() {
    await api.updateSubstitute(substitute.id, toSubstitutePayload(draft));
    await onChange();
  }

  async function remove() {
    await api.deleteSubstitute(substitute.id);
    await onChange();
  }

  return (
    <article
      className={cn(
        "grid gap-3 rounded-lg border bg-card p-3 xl:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] xl:items-center",
        !draft.active && "opacity-60",
      )}
    >
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.name}
        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
      />
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        type="email"
        value={draft.email}
        onChange={(event) => setDraft({ ...draft, email: event.target.value })}
      />
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.phoneNumber}
        onChange={(event) => setDraft({ ...draft, phoneNumber: event.target.value })}
      />
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.cellPhone}
        onChange={(event) => setDraft({ ...draft, cellPhone: event.target.value })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(event) => setDraft({ ...draft, active: event.target.checked })}
        />
        Active
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={save}>
          <Save className="size-4" />
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={remove}>
          <Trash2 className="size-4" />
          Deactivate
        </Button>
      </div>
      <div className="xl:col-span-6">
        <CalloutStatusButtons value={status} onChange={onChangeStatus} />
      </div>
    </article>
  );
}

function toSubstitutePayload(input: typeof emptySubstitute) {
  return {
    name: input.name,
    email: input.email.trim() || null,
    phoneNumber: input.phoneNumber.trim() || null,
    cellPhone: input.cellPhone.trim() || null,
    active: input.active,
  };
}
