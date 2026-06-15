import { describe, it, expect } from "vitest";

interface FormField { name: string; label: string; type: string; required?: boolean; }
interface FormConfig { fields: FormField[]; submitLabel: string; }

function renderPreviewHtml(config: FormConfig): string {
  const fields = config.fields.map(f => {
    const req = f.required ? " required" : "";
    return `<label>${f.label}</label><input name="${f.name}" type="${f.type}"${req}>`;
  }).join("\n");
  return `<form>\n${fields}\n<button>${config.submitLabel}</button>\n</form>`;
}

describe("Forms Preview", () => {
  const config: FormConfig = {
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    submitLabel: "Send",
  };

  it("should render form HTML", () => {
    const html = renderPreviewHtml(config);
    expect(html).toContain("<form>");
    expect(html).toContain("<button>Send</button>");
  });

  it("should include required attribute", () => {
    const html = renderPreviewHtml(config);
    expect(html).toContain("required");
  });

  it("should include field names", () => {
    const html = renderPreviewHtml(config);
    expect(html).toContain('name="name"');
    expect(html).toContain('name="email"');
  });
});
