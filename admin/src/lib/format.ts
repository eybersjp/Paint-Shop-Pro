import type { CurrencyCode } from "@/types/domain";

const currencyConfig: Record<string, { symbol: string; locale: string }> = {
  USD: { symbol: "$", locale: "en-US" },
  ZAR: { symbol: "R", locale: "en-ZA" },
  ZWG: { symbol: "ZiG", locale: "en-ZW" },
};

export function formatMoney(minorUnits: number, currency: CurrencyCode = "USD"): string {
  const cfg = currencyConfig[currency] ?? currencyConfig.USD;
  const major = minorUnits / 100;
  return `${cfg.symbol}${major.toLocaleString(cfg.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-ZW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
