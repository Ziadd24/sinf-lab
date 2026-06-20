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
export function serializeIds(ids: string[]): string {
  return ids.join(",")
}

export function deserializeIds(ids: string | null | undefined): string[] {
  return ids ? ids.split(",").filter(Boolean) : []
}