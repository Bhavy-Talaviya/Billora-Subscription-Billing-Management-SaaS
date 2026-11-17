/**
 * Currency formatting utility for Billora.
 * Formats price amounts in a human-readable way.
 *
 * Examples:
 *   formatPrice(999, "INR", "MONTHLY")  → "₹999/month"
 *   formatPrice(9999, "INR", "YEARLY")  → "₹9,999/year"
 *   formatPrice(2499, "INR", "ONE_TIME")→ "₹2,499 one-time"
 *   formatPrice(49, "USD", "MONTHLY")   → "$49/month"
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
  SGD: "S$",
};

const INTERVAL_LABELS: Record<string, string> = {
  MONTHLY: "/month",
  YEARLY: "/year",
  ONE_TIME: " one-time",
};

export function formatPrice(
  amount: number | string,
  currency = "USD",
  interval?: string
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  const isWhole = num % 1 === 0;

  const formatted = isWhole
    ? `${symbol}${num.toLocaleString("en-US")}`
    : `${symbol}${num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  if (interval && INTERVAL_LABELS[interval]) {
    return `${formatted}${INTERVAL_LABELS[interval]}`;
  }

  return formatted;
}

export function formatIntervalLabel(interval: string): string {
  const map: Record<string, string> = {
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
    ONE_TIME: "One-time",
  };
  return map[interval] ?? interval;
}

export function formatCurrencyAmount(
  amount: number | string,
  currency = "USD"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
