export type DateRangeValue = {
  from: string;
  to: string;
};

export type DateRangeField = "from" | "to";

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidDateInput(value: string): boolean {
  if (!DATE_INPUT_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function clampToMaxDate(value: string, maxDate: string): string {
  return value > maxDate ? maxDate : value;
}

function sanitizeDateInput(value: string, maxDate: string): string {
  const trimmed = value.trim();
  if (!trimmed || !isValidDateInput(trimmed)) {
    return "";
  }

  return clampToMaxDate(trimmed, maxDate);
}

export function normalizeDateRange(
  from?: string,
  to?: string,
  maxDate: string = getLocalDateString(),
): { from?: string; to?: string } {
  let nextFrom = from ? sanitizeDateInput(from, maxDate) : "";
  let nextTo = to ? sanitizeDateInput(to, maxDate) : "";

  if (nextFrom && nextTo && nextFrom > nextTo) {
    [nextFrom, nextTo] = [nextTo, nextFrom];
  }

  return {
    ...(nextFrom ? { from: nextFrom } : {}),
    ...(nextTo ? { to: nextTo } : {}),
  };
}

export function applyDateRangeChange(
  range: DateRangeValue,
  field: DateRangeField,
  value: string,
  maxDate: string = getLocalDateString(),
): DateRangeValue {
  if (!value) {
    return field === "from" ? { ...range, from: "" } : { ...range, to: "" };
  }

  const sanitized = sanitizeDateInput(value, maxDate);
  if (!sanitized) {
    return range;
  }

  if (field === "from") {
    const to =
      range.to && sanitized > range.to ? sanitized : range.to;
    return { from: sanitized, to };
  }

  const from =
    range.from && sanitized < range.from ? sanitized : range.from;
  return { from, to: sanitized };
}

export function getDateRangeInputBounds(
  range: DateRangeValue,
  field: DateRangeField,
  maxDate: string = getLocalDateString(),
): { min?: string; max?: string } {
  if (field === "from") {
    return { max: range.to && range.to < maxDate ? range.to : maxDate };
  }

  return {
    ...(range.from ? { min: range.from } : {}),
    max: maxDate,
  };
}

export function dateInputToStartOfDay(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function dateInputToEndOfDay(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}
