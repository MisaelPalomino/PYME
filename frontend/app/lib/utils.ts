import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function to_money(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatApiError(error: Record<string, string[]>) {
  return Object.entries(error)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("\n");
}
