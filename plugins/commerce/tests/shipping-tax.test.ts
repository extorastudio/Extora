import { describe, it, expect } from "vitest";

interface ShipmentItem {
  name: string;
  sku: string;
  quantity: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
}

interface ShippingRate {
  service: string;
  price: number;
  estimatedDays: number;
}

interface Address {
  country: string;
  state?: string;
  postalCode: string;
}

function calculateShipping(
  items: ShipmentItem[],
  destination: Address,
): ShippingRate[] {
  const totalWeight = items.reduce((sum, i) => sum + (i.weight ?? 1) * i.quantity, 0);
  const rates: ShippingRate[] = [];

  if (destination.country === destination.country) {
    rates.push({
      service: "Standard",
      price: 5.99 + totalWeight * 0.50,
      estimatedDays: destination.country === "US" ? 5 : 10,
    });

    if (totalWeight < 20) {
      rates.push({
        service: "Express",
        price: 15.99 + totalWeight * 0.75,
        estimatedDays: destination.country === "US" ? 2 : 5,
      });
    }
  }

  if (rates.length > 0 && rates[0]!.price > 50) {
    rates.push({
      service: "Free Shipping",
      price: 0,
      estimatedDays: rates[0]!.estimatedDays + 3,
    });
  }

  return rates;
}

function calculateTax(
  subtotal: number,
  destination: Address,
): { rate: number; amount: number; name: string } {
  const usRates: Record<string, number> = {
    CA: 7.25, NY: 8.875, TX: 6.25, FL: 6.0, WA: 6.5,
  };

  if (destination.country === "US" && destination.state) {
    const rate = usRates[destination.state] ?? 5.0;
    return {
      rate,
      amount: subtotal * (rate / 100),
      name: `${destination.state} Sales Tax`,
    };
  }

  if (destination.country === "EU") {
    const rate = 20;
    return { rate, amount: subtotal * 0.2, name: "EU VAT" };
  }

  return { rate: 0, amount: 0, name: "No Tax" };
}

describe("Shipping Calculator", () => {
  const usAddress: Address = { country: "US", state: "CA", postalCode: "90001" };
  const euAddress: Address = { country: "EU", state: "DE", postalCode: "10115" };

  it("should calculate standard and express rates for US", () => {
    const items: ShipmentItem[] = [
      { name: "Widget", sku: "W-1", quantity: 2, weight: 0.5 },
    ];
    const rates = calculateShipping(items, usAddress);
    expect(rates.length).toBeGreaterThanOrEqual(2);
    expect(rates[0]!.service).toBe("Standard");
    expect(rates[1]!.service).toBe("Express");
  });

  it("should charge more for heavier items", () => {
    const light: ShipmentItem[] = [{ name: "A", sku: "A", quantity: 1, weight: 0.1 }];
    const heavy: ShipmentItem[] = [{ name: "B", sku: "B", quantity: 1, weight: 10 }];

    const lightRates = calculateShipping(light, usAddress);
    const heavyRates = calculateShipping(heavy, usAddress);

    expect(heavyRates[0]!.price).toBeGreaterThan(lightRates[0]!.price);
  });

  it("should offer free shipping for orders over threshold", () => {
    const items: ShipmentItem[] = Array(20).fill({
      name: "Heavy", sku: "H", quantity: 1, weight: 5,
    });
    const rates = calculateShipping(items, usAddress);
    expect(rates.some((r) => r.service === "Free Shipping")).toBe(true);
  });
});

describe("Tax Calculator", () => {
  it("should calculate CA sales tax", () => {
    const tax = calculateTax(100, { country: "US", state: "CA", postalCode: "90001" });
    expect(tax.rate).toBe(7.25);
    expect(tax.amount).toBeCloseTo(7.25);
    expect(tax.name).toContain("CA");
  });

  it("should calculate NY sales tax", () => {
    const tax = calculateTax(100, { country: "US", state: "NY", postalCode: "10001" });
    expect(tax.rate).toBe(8.875);
    expect(tax.amount).toBe(8.875);
  });

  it("should calculate EU VAT", () => {
    const tax = calculateTax(100, { country: "EU", state: "DE", postalCode: "10115" });
    expect(tax.rate).toBe(20);
    expect(tax.amount).toBe(20);
  });

  it("should return zero tax for unsupported country", () => {
    const tax = calculateTax(100, { country: "XX", postalCode: "00000" });
    expect(tax.rate).toBe(0);
    expect(tax.amount).toBe(0);
  });
});
