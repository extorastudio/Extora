import { describe, it, expect } from "vitest";
function validateSchema(schema: Record<string,unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!schema["@context"]) errors.push("Missing @context");
  if (!schema["@type"]) errors.push("Missing @type");
  return { valid: errors.length===0, errors };
}
describe("SEO Schema Validator", () => {
  it("should validate correct schema", () => { expect(validateSchema({"@context":"https://schema.org","@type":"Article"}).valid).toBe(true); });
  it("should reject missing context", () => { const r = validateSchema({"@type":"Article"}); expect(r.valid).toBe(false); });
  it("should reject missing type", () => { const r = validateSchema({"@context":"https://schema.org"}); expect(r.valid).toBe(false); });
});
