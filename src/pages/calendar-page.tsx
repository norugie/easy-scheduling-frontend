import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type CalendarSummary } from "@/lib/api";
import { DayDetailPage } from "@/pages/day-detail-page";
import {
  addMonths,
  getMonthRange,
  monthLabel,
  parseDateString,
  toDateString,
} from "@/lib/date";
import { cn } from "@/lib/utils";

export function CalendarPage({
  navigate,
  initialSelectedDate,
}: {
  navigate: (path: string) => void;
  initialSelectedDate?: string;
}) {
  const [activeMonth, setActiveMonth] = useState(
    () =>
      startOfMonth(
        initialSelectedDate ? parseDateString(initialSelectedDate) : new Date(),
      ),
  );
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate ?? "");
  const [summary, setSummary] = useState<CalendarSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const range = getMonthRange(activeMonth);

  async function loadSummary() {
    setLoading(true);
    setError("");
    try {
      setSummary(await api.calendarSummary(range.startDate, range.endDate));
    } catch {
      setError("Could not load calendar data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, [range.endDate, range.startDate]);

  useEffect(() => {
    if (!initialSelectedDate) return;
    setActiveMonth(startOfMonth(parseDateString(initialSelectedDate)));
    setSelectedDate(initialSelectedDate);
  }, [initialSelectedDate]);

  const summaryByDate = useMemo(
    () => new Map(summary.map((item) => [item.date, item])),
    [summary],
  );

  function openDay(date: string) {
    setSelectedDate(date);
    navigate("/calendar");
  }

  function closeDay() {
    setSelectedDate("");
    navigate("/calendar");
  }

  return (
    <div className="grid gap-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Monthly calendar</p>
          <h2 className="text-2xl font-semibold">{monthLabel(activeMonth)}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveMonth(addMonths(activeMonth, -1))}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveMonth(addMonths(activeMonth, 1))}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading calendar...</p> : null}

      <div className="max-w-6xl">
        <MonthCalendar
          month={activeMonth}
          summaries={summaryByDate}
          onSelectDate={openDay}
        />
      </div>

      {selectedDate ? (
        <DayDetailModal
          date={selectedDate}
          navigate={navigate}
          onClose={closeDay}
          onChange={loadSummary}
        />
      ) : null}
    </div>
  );
}

function MonthCalendar({
  month,
  summaries,
  onSelectDate,
}: {
  month: Date;
  summaries: Map<string, CalendarSummary>;
  onSelectDate: (date: string) => void;
}) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const today = toDateString(new Date());

  return (
    <section className="rounded-lg border bg-card p-3">
      <h3 className="px-1 pb-3 font-medium">{monthLabel(month)}</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) {
            return <div key={`blank-${index}`} className="min-h-24 sm:min-h-28" />;
          }

          const date = toDateString(new Date(month.getFullYear(), month.getMonth(), day));
          const summary = summaries.get(date);
          const awayPeople = summary?.awayPeople ?? [];
          const visibleAwayPeople = awayPeople.slice(0, 2);
          const hiddenAwayCount = awayPeople.length - visibleAwayPeople.length;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              title={awayPeople.length ? awayPeople.join(", ") : undefined}
              className={cn(
                "flex min-h-24 flex-col items-start gap-1 rounded-md border p-2 text-left text-sm outline-none transition hover:border-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring sm:min-h-28",
                date === today && "border-primary text-primary",
                summary?.hasCanceledAssignment && "border-destructive/60",
              )}
            >
              <span className="font-medium leading-none">{day}</span>
              {awayPeople.length ? (
                <span className="grid w-full gap-0.5 text-[11px] leading-tight text-foreground/80">
                  {visibleAwayPeople.map((name) => (
                    <span key={name} className="block max-w-full truncate">
                      {name}
                    </span>
                  ))}
                  {hiddenAwayCount > 0 ? (
                    <span className="text-muted-foreground">+{hiddenAwayCount} more</span>
                  ) : null}
                </span>
              ) : null}
              {summary ? (
                <span className="mt-auto flex justify-start gap-1 pt-1">
                  {summary.hasAbsence ? <Dot className="bg-primary" /> : null}
                  {summary.hasAssignment ? <Dot className="bg-sky-500" /> : null}
                  {summary.hasCallout ? <Dot className="bg-amber-500" /> : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DayDetailModal({
  date,
  navigate,
  onClose,
  onChange,
}: {
  date: string;
  navigate: (path: string) => void;
  onClose: () => void;
  onChange: () => void | Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="m-auto max-h-[90vh] w-[min(96vw,1100px)] overflow-y-auto rounded-lg border bg-background p-0 text-foreground shadow-xl"
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
      onClose={onClose}
    >
      <div className="sticky top-0 z-10 flex items-center justify-end border-b bg-background p-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close day detail"
          onClick={() => dialogRef.current?.close()}
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="p-4">
        <DayDetailPage
          date={date}
          navigate={navigate}
          showChrome={false}
          onChange={onChange}
        />
      </div>
    </dialog>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={cn("size-1.5 rounded-full", className)} />;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
