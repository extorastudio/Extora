import { describe, it, expect } from "vitest";

function formatCurrency(amount: number, currency: string, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

function convertCurrency(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  return (amount / fromRate) * toRate;
}

describe("Currency Formatter", () => {
  it("should format USD", () => {
    expect(formatCurrency(29.99, "USD")).toContain("29.99");
  });

  it("should format EUR", () => {
    expect(formatCurrency(49.99, "EUR")).toContain("49.99");
  });

  it("should format JPY (no decimals)", () => {
    const result = formatCurrency(5000, "JPY");
    expect(result).toContain("5,000");
  });

  it("should convert between currencies", () => {
    const rates = { USD: 1, EUR: 0.92, GBP: 0.79 };
    const converted = convertCurrency(100, "USD", "EUR", rates);
    expect(converted).toBeCloseTo(92, 0);
  });

  it("should handle same currency conversion", () => {
    expect(convertCurrency(100, "USD", "USD", {})).toBe(100);
  });
});
