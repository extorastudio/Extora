import { describe, it, expect } from "vitest";

function generateArticleSchema(title: string, author: string, date: string, image?: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    author: { "@type": "Person", name: author },
    datePublished: date,
    image: image ?? "",
  };
}

function generateProductSchema(name: string, price: number, currency: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    offers: { "@type": "Offer", price, priceCurrency: currency, availability: "https://schema.org/InStock" },
  };
}

describe("SEO Structured Data", () => {
  it("should generate Article schema", () => {
    const schema = generateArticleSchema("My Post", "Alice", "2026-06-15");
    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe("My Post");
    expect((schema.author as Record<string, unknown>).name).toBe("Alice");
  });

  it("should generate Product schema", () => {
    const schema = generateProductSchema("Widget", 29.99, "USD");
    expect(schema["@type"]).toBe("Product");
    const offers = schema.offers as Record<string, unknown>;
    expect(offers.price).toBe(29.99);
    expect(offers.priceCurrency).toBe("USD");
  });

  it("should include image in Article schema when provided", () => {
    const schema = generateArticleSchema("Post", "Bob", "2026-01-01", "img.jpg");
    expect(schema.image).toBe("img.jpg");
  });
});
