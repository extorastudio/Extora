import { describe, it, expect } from "vitest";
interface ConfigSchema { key: string; type: string; required?: boolean; default?: unknown; }
function validateConfig(value: unknown, schema: ConfigSchema): { valid: boolean; error?: string } {
  if (schema.required && (value === undefined || value === null)) return { valid: false, error: `${schema.key} is required` };
  if (schema.type === "number" && typeof value !== "number") return { valid: false, error: `${schema.key} must be a number` };
  if (schema.type === "string" && typeof value !== "string") return { valid: false, error: `${schema.key} must be a string` };
  return { valid: true };
}
describe("Config Validation", () => {
  it("should validate string", () => { expect(validateConfig("hello", {key:"k",type:"string"}).valid).toBe(true); });
  it("should validate number", () => { expect(validateConfig(42, {key:"k",type:"number"}).valid).toBe(true); });
  it("should reject wrong type", () => { expect(validateConfig("x", {key:"k",type:"number"}).valid).toBe(false); });
  it("should reject missing required", () => { expect(validateConfig(undefined, {key:"k",type:"string",required:true}).valid).toBe(false); });
});
