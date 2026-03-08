/**
 * Shared utilities. Add helpers here as needed.
 */

/** UUID v4 pattern (TypeORM/Postgres default) for validation */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function noop(): void {}

export function isUuid(value: string): boolean {
  return typeof value === "string" && UUID_V4_REGEX.test(value);
}
