const priceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Format a price with two fixed decimal places, e.g. 214.6 -> "214.60". */
export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

/** Format a currency amount, e.g. 184260 -> "$184,260". */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Format a volume as "1.2M", "12.5K" or a plain number. */
export function formatCompactVolume(value: number): string {
  if (!value) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

/** Format a percentage change with an explicit sign, e.g. "+1.84%". */
export function formatPercentChange(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
