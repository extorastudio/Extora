import { describe, it, expect } from "vitest";
describe("Forms Thank You Page", () => {
  function renderMessage(msg: string, vars: Record<string,string>): string { let r=msg; for(const[k,v]of Object.entries(vars)) r=r.replace(`{{${k}}}`,v); return r; }
  it("should render personalized message", () => { expect(renderMessage("Thanks {{name}}!",{name:"Alice"})).toBe("Thanks Alice!"); });
  it("should handle missing vars", () => { expect(renderMessage("Hello {{name}}",{})).toContain("{{name}}"); });
});
