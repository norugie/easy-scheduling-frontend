export function todayDateString() {
  return toDateString(new Date());
}

export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateString(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function getTwelveMonthRange(baseMonth: Date) {
  const start = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1);
  const end = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 12, 0);
  return {
    startDate: toDateString(start),
    endDate: toDateString(end),
  };
}

export function getMonthRange(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  return {
    startDate: toDateString(start),
    endDate: toDateString(end),
  };
}

export function monthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function dayLabel(value: string) {
  return parseDateString(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function compactDayLabel(value: string) {
  return parseDateString(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
