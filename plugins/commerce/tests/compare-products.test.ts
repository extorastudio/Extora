import { describe, it, expect } from "vitest";

interface Product { id: string; name: string; price: number; specs: Record<string,string>; }

function compare(p1: Product, p2: Product): { same: string[]; different: string[] } {
  const same: string[] = []; const different: string[] = [];
  if (p1.price === p2.price) same.push("price"); else different.push("price");
  for (const key of new Set([...Object.keys(p1.specs), ...Object.keys(p2.specs)])) {
    if (p1.specs[key] === p2.specs[key]) same.push(key); else different.push(key);
  }
  return { same, different };
}

describe("Product Comparison", () => {
  const p1: Product = { id: "1", name: "A", price: 100, specs: { color: "red", size: "M" } };
  const p2: Product = { id: "2", name: "B", price: 100, specs: { color: "blue", size: "M" } };

  it("should find matching price", () => {
    const result = compare(p1, p2);
    expect(result.same).toContain("price");
    expect(result.same).toContain("size");
  });

  it("should find different specs", () => {
    const result = compare(p1, p2);
    expect(result.different).toContain("color");
  });

  it("should handle identical products", () => {
    const result = compare(p1, p1);
    expect(result.different.length).toBe(0);
  });
});
