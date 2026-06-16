import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * SQLite has no native array type, so `LabSample.testIds` is stored as a
 * comma-separated string. These helpers convert at the API boundary so the
 * rest of the app can keep working with string[] as before.
 */
export function serializeTestIds(testIds: string[]): string {
  return testIds.join(",")
}

export function deserializeTestIds(testIds: string): string[] {
  return testIds ? testIds.split(",").filter(Boolean) : []
}