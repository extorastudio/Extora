import { describe, it, expect } from "vitest";

interface ContentField {
  name: string; label: string; type: string;
  required?: boolean; min?: number; max?: number; pattern?: string;
}

interface ValidationResult { valid: boolean; errors: string[]; }

function validateEntry(data: Record<string, unknown>, fields: ContentField[]): ValidationResult {
  const errors: string[] = [];
  for (const field of fields) {
    const value = data[field.name];
    if (field.required && (value === undefined || value === null || value === "")) {
      errors.push(`"${field.label}" is required`);
    }
    if (field.type === "email" && typeof value === "string" && value.length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`"${field.label}" must be a valid email`);
      }
    }
    if (field.type === "number" && typeof value === "number") {
      if (field.min !== undefined && value < field.min) {
        errors.push(`"${field.label}" must be at least ${field.min}`);
      }
      if (field.max !== undefined && value > field.max) {
        errors.push(`"${field.label}" must be at most ${field.max}`);
      }
    }
    if (field.type === "text" && typeof value === "string" && field.min !== undefined) {
      if (value.length < field.min) {
        errors.push(`"${field.label}" must be at least ${field.min} characters`);
      }
    }
    if (field.pattern && typeof value === "string") {
      if (!new RegExp(field.pattern).test(value)) {
        errors.push(`"${field.label}" does not match required format`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

const blogFields: ContentField[] = [
  { name: "title", label: "Title", type: "text", required: true, min: 3, max: 200 },
  { name: "author_email", label: "Author Email", type: "email", required: true },
  { name: "rating", label: "Rating", type: "number", required: false, min: 1, max: 5 },
  { name: "slug", label: "URL Slug", type: "text", required: true, pattern: "^[a-z0-9-]+$" },
];

describe("Content Validation", () => {
  it("should validate a correct entry", () => {
    const result = validateEntry({
      title: "Hello World",
      author_email: "test@example.com",
      rating: 4,
      slug: "hello-world",
    }, blogFields);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("should reject missing required fields", () => {
    const result = validateEntry({ title: "Test" }, blogFields);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("Author Email"))).toBe(true);
    expect(result.errors.some(e => e.includes("URL Slug"))).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = validateEntry({
      title: "Test", author_email: "not-email", slug: "test",
    }, blogFields);
    expect(result.errors.some(e => e.includes("email"))).toBe(true);
  });

  it("should reject title too short", () => {
    const result = validateEntry({
      title: "Hi", author_email: "a@b.com", slug: "test",
    }, blogFields);
    expect(result.errors.some(e => e.includes("Title"))).toBe(true);
  });

  it("should reject number outside range", () => {
    const result = validateEntry({
      title: "Hello", author_email: "a@b.com", slug: "test", rating: 10,
    }, blogFields);
    expect(result.errors.some(e => e.includes("Rating"))).toBe(true);
  });

  it("should reject slug with invalid characters", () => {
    const result = validateEntry({
      title: "Hello", author_email: "a@b.com", slug: "Hello World!",
    }, blogFields);
    expect(result.errors.some(e => e.includes("Slug"))).toBe(true);
  });

  it("should accept empty optional fields", () => {
    const result = validateEntry({
      title: "Hello World", author_email: "a@b.com", slug: "test",
    }, blogFields);
    expect(result.valid).toBe(true);
  });
});
