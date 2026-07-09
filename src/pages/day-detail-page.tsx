import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Printer, Save, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  api,
  type Absence,
  type Assignment,
  type CanceledAssignment,
  type Community,
  type DayDetail,
  type Substitute,
} from "@/lib/api";
import { compactDayLabel, dayLabel } from "@/lib/date";

export function DayDetailPage({
  date,
  navigate,
  onChange,
  showChrome = true,
}: {
  date: string;
  navigate: (path: string) => void;
  onChange?: () => void | Promise<void>;
  showChrome?: boolean;
}) {
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [substitutes, setSubstitutes] = useState<Substitute[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [notes, setNotes] = useState("");
  const [absenceForm, setAbsenceForm] = useState({
    personAwayName: "",
    startDate: date,
    endDate: date,
    notes: "",
  });
  const [assignmentForm, setAssignmentForm] = useState({
    absenceId: "",
    substituteId: "",
    communityId: "",
    substituteName: "",
    startDate: date,
    endDate: date,
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [day, subs, communityRows] = await Promise.all([
        api.day(date),
        api.substitutes(),
        api.communities(),
      ]);
      setDetail(day);
      setNotes(day.notes);
      setSubstitutes(subs);
      setCommunities(communityRows);
      setAssignmentForm((current) => ({
        ...current,
        communityId: current.communityId || String(communityRows[0]?.id ?? ""),
      }));
    } catch {
      setError("Could not load this day.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setAbsenceForm((current) => ({ ...current, startDate: date, endDate: date }));
    setAssignmentForm((current) => ({ ...current, startDate: date, endDate: date }));
    void load();
  }, [date]);

  async function refresh() {
    await load();
    await onChange?.();
  }

  async function saveNotes() {
    await api.updateDayNotes(date, notes);
    await refresh();
  }

  async function createAbsence(event: React.FormEvent) {
    event.preventDefault();
    await api.createAbsence(absenceForm);
    setAbsenceForm({ personAwayName: "", startDate: date, endDate: date, notes: "" });
    await refresh();
  }

  async function createAssignment(event: React.FormEvent) {
    event.preventDefault();
    await api.createAssignment({
      absenceId: assignmentForm.absenceId ? Number(assignmentForm.absenceId) : null,
      substituteId: assignmentForm.substituteId ? Number(assignmentForm.substituteId) : null,
      communityId: Number(assignmentForm.communityId),
      substituteName: assignmentForm.substituteName || undefined,
      startDate: assignmentForm.startDate,
      endDate: assignmentForm.endDate,
      notes: assignmentForm.notes || null,
    });
    setAssignmentForm({
      absenceId: "",
      substituteId: "",
      communityId: assignmentForm.communityId,
      substituteName: "",
      startDate: date,
      endDate: date,
      notes: "",
    });
    await refresh();
  }

  return (
    <div className="grid gap-6">
      {showChrome ? (
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/calendar")}>
            <ArrowLeft className="size-4" />
            Calendar
          </Button>
          <Button type="button" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      ) : null}

      <section className="print-surface grid gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Day detail</p>
          <h2 className="text-3xl font-semibold">{dayLabel(date)}</h2>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {loading ? <p className="text-sm text-muted-foreground">Loading day...</p> : null}

        <section className="grid gap-3 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Day notes</h3>
            <Button type="button" size="sm" onClick={saveNotes}>
              <Save className="size-4" />
              Save
            </Button>
          </div>
          <textarea
            className="min-h-24 rounded-md border bg-background p-3 outline-none focus:ring-2 focus:ring-ring"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </section>

        <section className="grid gap-3">
          <h3 className="text-lg font-semibold">Person away</h3>
          <form
            onSubmit={createAbsence}
            className="no-print grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_auto_auto_1fr_auto]"
          >
            <input
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              placeholder="Person away"
              value={absenceForm.personAwayName}
              onChange={(event) =>
                setAbsenceForm({ ...absenceForm, personAwayName: event.target.value })
              }
              required
            />
            <input
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              type="date"
              value={absenceForm.startDate}
              onChange={(event) =>
                setAbsenceForm({ ...absenceForm, startDate: event.target.value })
              }
              required
            />
            <input
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              type="date"
              value={absenceForm.endDate}
              onChange={(event) =>
                setAbsenceForm({ ...absenceForm, endDate: event.target.value })
              }
              required
            />
            <input
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              placeholder="Notes"
              value={absenceForm.notes}
              onChange={(event) =>
                setAbsenceForm({ ...absenceForm, notes: event.target.value })
              }
            />
            <Button type="submit">
              <Plus className="size-4" />
              Add
            </Button>
          </form>

          {detail?.absences.length ? (
            detail.absences.map((absence) => (
              <AbsenceRow key={absence.id} absence={absence} onChange={refresh} />
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No absences for {compactDayLabel(date)}.
            </p>
          )}
        </section>

        <section className="grid gap-3">
          <h3 className="text-lg font-semibold">Subs / replacement</h3>
          <form
            onSubmit={createAssignment}
            className="no-print grid gap-3 rounded-lg border bg-card p-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto_auto_1fr_auto]"
          >
            <select
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              value={assignmentForm.absenceId}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, absenceId: event.target.value })
              }
            >
              <option value="">No linked absence</option>
              {detail?.absences.map((absence) => (
                <option key={absence.id} value={absence.id}>
                  {absence.personAwayName}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              value={assignmentForm.substituteId}
              onChange={(event) =>
                setAssignmentForm({
                  ...assignmentForm,
                  substituteId: event.target.value,
                  substituteName: "",
                })
              }
            >
              <option value="">One-off replacement</option>
              {substitutes.map((substitute) => (
                <option key={substitute.id} value={substitute.id}>
                  {substitute.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              value={assignmentForm.communityId}
              onChange={(event) =>
                setAssignmentForm({
                  ...assignmentForm,
                  communityId: event.target.value,
                })
              }
              required
            >
              <option value="">Select community</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
            <input
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              placeholder="One-off name"
              value={assignmentForm.substituteName}
              onChange={(event) =>
                setAssignmentForm({
                  ...assignmentForm,
                  substituteId: "",
                  substituteName: event.target.value,
                })
              }
            />
            <input
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              type="date"
              value={assignmentForm.startDate}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, startDate: event.target.value })
              }
              required
            />
            <input
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              type="date"
              value={assignmentForm.endDate}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, endDate: event.target.value })
              }
              required
            />
            <input
              className="h-10 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              placeholder="Notes"
              value={assignmentForm.notes}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, notes: event.target.value })
              }
            />
            <Button type="submit" disabled={!communities.length}>
              <Plus className="size-4" />
              Add
            </Button>
          </form>

          {detail?.assignments.length ? (
            detail.assignments.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                date={date}
                communities={communities}
                onChange={refresh}
              />
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No active substitutes for {compactDayLabel(date)}.
            </p>
          )}

          {detail?.canceledAssignments.map((assignment) => (
            <CanceledAssignmentRow
              key={`${assignment.id}-${assignment.exception.date}`}
              assignment={assignment}
              communities={communities}
              onChange={refresh}
            />
          ))}
        </section>

        <section className="grid gap-3">
          <h3 className="text-lg font-semibold">Callout history</h3>
          {detail?.callouts.length ? (
            <div className="grid gap-2">
              {detail.callouts.map((callout) => (
                <div
                  key={callout.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3"
                >
                  <span className="font-medium">{callout.substituteName}</span>
                  <span className="rounded-md bg-accent px-2 py-1 text-sm">
                    {callout.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No callout statuses recorded for this date.
            </p>
          )}
        </section>
      </section>
    </div>
  );
}

function AbsenceRow({
  absence,
  onChange,
}: {
  absence: Absence;
  onChange: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(absence);

  async function save() {
    await api.updateAbsence(absence.id, {
      personAwayName: draft.personAwayName,
      startDate: draft.startDate,
      endDate: draft.endDate,
      notes: draft.notes,
    });
    await onChange();
  }

  async function remove() {
    await api.deleteAbsence(absence.id);
    await onChange();
  }

  return (
    <article className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[1fr_auto_auto_1fr_auto] md:items-center">
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.personAwayName}
        onChange={(event) => setDraft({ ...draft, personAwayName: event.target.value })}
      />
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        type="date"
        value={draft.startDate}
        onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
      />
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        type="date"
        value={draft.endDate}
        onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
      />
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.notes ?? ""}
        onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
      />
      <RowActions onSave={save} onDelete={remove} />
    </article>
  );
}

function AssignmentRow({
  assignment,
  date,
  communities,
  onChange,
}: {
  assignment: Assignment;
  date: string;
  communities: Community[];
  onChange: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(assignment);

  async function save() {
    await api.updateAssignment(assignment.id, {
      communityId: draft.communityId,
      substituteName: draft.substituteName,
      startDate: draft.startDate,
      endDate: draft.endDate,
      notes: draft.notes,
    });
    await onChange();
  }

  async function remove() {
    await api.deleteAssignment(assignment.id);
    await onChange();
  }

  async function cancelOneDay() {
    await api.createAssignmentException(assignment.id, {
      date,
      reason: "Canceled for this day",
    });
    await onChange();
  }

  return (
    <article className="grid gap-3 rounded-lg border bg-card p-3 lg:grid-cols-[1fr_1fr_auto_auto_1fr_auto] lg:items-center">
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.substituteName}
        onChange={(event) => setDraft({ ...draft, substituteName: event.target.value })}
      />
      <select
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.communityId}
        onChange={(event) =>
          setDraft({ ...draft, communityId: Number(event.target.value) })
        }
      >
        {communities.map((community) => (
          <option key={community.id} value={community.id}>
            {community.name}
          </option>
        ))}
      </select>
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        type="date"
        value={draft.startDate}
        onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
      />
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        type="date"
        value={draft.endDate}
        onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
      />
      <input
        className="h-9 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
        value={draft.notes ?? ""}
        onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={cancelOneDay}>
          <XCircle className="size-4" />
          Cancel day
        </Button>
        <RowActions onSave={save} onDelete={remove} />
      </div>
    </article>
  );
}

function CanceledAssignmentRow({
  assignment,
  communities,
  onChange,
}: {
  assignment: CanceledAssignment;
  communities: Community[];
  onChange: () => Promise<void>;
}) {
  const communityName =
    communities.find((community) => community.id === assignment.communityId)?.name ??
    "Unknown community";

  async function restore() {
    await api.deleteAssignmentException(assignment.id, assignment.exception.date);
    await onChange();
  }

  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
      <div>
        <p className="font-medium">{assignment.substituteName}</p>
        <p className="text-sm text-muted-foreground">
          {communityName} - canceled for this day
          {assignment.exception.reason ? `: ${assignment.exception.reason}` : ""}
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={restore}>
        Restore
      </Button>
    </article>
  );
}

function RowActions({
  onSave,
  onDelete,
}: {
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onSave}>
        <Save className="size-4" />
        Save
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onDelete}>
        <Trash2 className="size-4" />
        Delete
      </Button>
    </div>
  );
}
