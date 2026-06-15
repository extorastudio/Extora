import { describe, it, expect } from "vitest";
interface EmailTemplate { subject: string; body: string; recipient: string; }
function renderTemplate(tmpl: EmailTemplate, vars: Record<string,string>): string {
  let result = tmpl.body;
  for(const [k,v] of Object.entries(vars)) { result = result.replace(`{{${k}}}`,v); }
  return result;
}
describe("Forms Email Templates", () => {
  const tmpl: EmailTemplate = { subject:"New Submission", body:"Hi {{name}},\nThanks for contacting us!\n\n- Team", recipient:"{{email}}" };
  it("should render template with variables", () => { const rendered = renderTemplate(tmpl, {name:"Alice"}); expect(rendered).toContain("Alice"); });
  it("should keep unmatched placeholders", () => { expect(renderTemplate(tmpl, {})).toContain("{{name}}"); });
});
