export function hasActiveFilters<T extends Record<string, unknown>>(
  current: T,
  defaults: T,
): boolean {
  return (Object.keys(defaults) as Array<keyof T>).some(
    (key) => current[key] !== defaults[key],
  );
}
