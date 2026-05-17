import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMalaysiaTime(value: string | number | Date) {
  const d = new Date(value);
  try {
    // Format components in Asia/Kuala_Lumpur then append 'MYT' explicitly
    const formatted = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kuala_Lumpur",
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
    return `${formatted} MYT`;
  } catch {
    return d.toString();
  }
}
