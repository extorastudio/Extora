import { describe, it, expect } from "vitest";

interface FormField {
  name: string; label: string; type: string;
  required?: boolean; minLength?: number; maxLength?: number;
  options?: string[]; min?: number; max?: number;
}

interface ValidationResult { valid: boolean; errors: Record<string, string>; }

function validateFormFields(data: Record<string, unknown>, fields: FormField[]): ValidationResult {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = data[field.name];

    if (field.required && (value === undefined || value === null || value === "")) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }

    if (typeof value === "string" && value.length > 0) {
      if (field.minLength && value.length < field.minLength) {
        errors[field.name] = `${field.label} must be at least ${field.minLength} characters`;
      }
      if (field.maxLength && value.length > field.maxLength) {
        errors[field.name] = `${field.label} must be at most ${field.maxLength} characters`;
      }
    }

    if (field.type === "email" && typeof value === "string" && value.length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.name] = `${field.label} must be a valid email`;
      }
    }

    if (field.type === "number" && typeof value === "number") {
      if (field.min !== undefined && value < field.min) {
        errors[field.name] = `${field.label} must be at least ${field.min}`;
      }
      if (field.max !== undefined && value > field.max) {
        errors[field.name] = `${field.label} must be at most ${field.max}`;
      }
    }

    if (field.options && typeof value === "string" && value.length > 0) {
      if (!field.options.includes(value)) {
        errors[field.name] = `${field.label} must be one of: ${field.options.join(", ")}`;
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

const contactFields: FormField[] = [
  { name: "name", label: "Name", type: "text", required: true, minLength: 2, maxLength: 100 },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "age", label: "Age", type: "number", min: 18, max: 120 },
  { name: "plan", label: "Plan", type: "select", options: ["basic", "pro", "enterprise"] },
  { name: "bio", label: "Bio", type: "textarea", maxLength: 500 },
];

describe("Forms Field Validation", () => {
  it("should validate all fields correctly", () => {
    const result = validateFormFields({
      name: "Alice", email: "alice@test.com", age: 25, plan: "pro", bio: "Developer",
    }, contactFields);
    expect(result.valid).toBe(true);
  });

  it("should require name and email", () => {
    const result = validateFormFields({}, contactFields);
    expect(result.errors["name"]).toBeDefined();
    expect(result.errors["email"]).toBeDefined();
  });

  it("should validate email format", () => {
    const result = validateFormFields({ name: "Bob", email: "bad", age: 20, plan: "basic" }, contactFields);
    expect(result.errors["email"]).toContain("valid email");
  });

  it("should validate number min/max", () => {
    const result = validateFormFields({ name: "Bob", email: "b@b.com", age: 15, plan: "basic" }, contactFields);
    expect(result.errors["age"]).toContain("at least 18");
  });

  it("should validate select options", () => {
    const result = validateFormFields({ name: "Bob", email: "b@b.com", age: 20, plan: "invalid" }, contactFields);
    expect(result.errors["plan"]).toContain("one of");
  });

  it("should validate max length", () => {
    const result = validateFormFields({
      name: "Bob", email: "b@b.com", age: 20, plan: "basic",
      bio: "x".repeat(501),
    }, contactFields);
    expect(result.errors["bio"]).toContain("at most 500");
  });
});
