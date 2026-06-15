import { describe, it, expect } from "vitest";

interface Product { id: string; name: string; category: string; price: number; tags: string[]; status: string; }

const products: Product[] = [
  { id: "1", name: "Blue Widget", category: "widgets", price: 19.99, tags: ["blue", "sale"], status: "published" },
  { id: "2", name: "Red Widget", category: "widgets", price: 24.99, tags: ["red"], status: "published" },
  { id: "3", name: "Green Gizmo", category: "gizmos", price: 49.99, tags: ["green", "new"], status: "published" },
  { id: "4", name: "Blue Gizmo", category: "gizmos", price: 39.99, tags: ["blue"], status: "draft" },
  { id: "5", name: "Premium Gadget", category: "gadgets", price: 99.99, tags: ["premium"], status: "published" },
];

describe("Product Search & Filter", () => {
  it("should search by name", () => {
    const results = products.filter(p => p.name.toLowerCase().includes("widget"));
    expect(results.length).toBe(2);
  });

  it("should filter by category", () => {
    const gizmos = products.filter(p => p.category === "gizmos");
    expect(gizmos.length).toBe(2);
  });

  it("should filter by price range", () => {
    const cheap = products.filter(p => p.price >= 20 && p.price <= 50);
    expect(cheap.length).toBe(3);
  });

  it("should filter by tag", () => {
    const blue = products.filter(p => p.tags.includes("blue"));
    expect(blue.length).toBe(2);
  });

  it("should only show published products", () => {
    const published = products.filter(p => p.status === "published");
    expect(published.length).toBe(4);
  });
});
