/**
 * SQLite-compatible IDs serialization.
 *
 * SQLite doesn't support native arrays (String[]), so we store IDs
 * as a JSON-encoded string and convert in the application layer.
 * This keeps the frontend and Zod validators unchanged (they still see string[]).
 */

/** Convert string[] → JSON string for DB storage */
export function serializeIds(ids: string[]): string {
  return JSON.stringify(ids);
}

/** Convert JSON string from DB → string[] for app use */
export function deserializeIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Fallback: if it's a comma-separated string (legacy), split it
    return raw.split(",").filter(Boolean);
  }
}

/**
 * Deserialize testIds on a sample object (or any object with a testIds field).
 * Returns a new object with testIds converted from string → string[].
 */
export function deserializeSample<T extends { testIds: string }>(sample: T): Omit<T, "testIds"> & { testIds: string[] } {
  return {
    ...sample,
    testIds: deserializeIds(sample.testIds),
  };
}