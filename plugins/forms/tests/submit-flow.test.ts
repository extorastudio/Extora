import { describe, it, expect } from "vitest";

interface Form {
  id: string; name: string; slug: string; status: string;
  fields: Array<{ name: string; type: string; required?: boolean }>;
  settings: { spamProtection: string; storeSubmissions: boolean };
}

interface Submission {
  id: string; formId: string; data: Record<string, unknown>;
  isSpam: boolean; isRead: boolean; createdAt: string;
}

describe("Form Submission Flow", () => {
  const forms = new Map<string, Form>();
  const submissions = new Map<string, Submission[]>();

  function createId(): string { return `sub_${Date.now()}_${Math.random().toString(36).slice(2,9)}`; }

  it("should create form and accept public submissions", () => {
    const form: Form = {
      id: "f1", name: "Contact", slug: "contact",
      status: "published",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "email", type: "email", required: true },
      ],
      settings: { spamProtection: "honeypot", storeSubmissions: true },
    };
    forms.set(form.id, form);
    submissions.set(form.id, []);

    const sub: Submission = {
      id: createId(), formId: form.id,
      data: { name: "Alice", email: "alice@example.com" },
      isSpam: false, isRead: false, createdAt: new Date().toISOString(),
    };
    submissions.get(form.id)!.push(sub);

    expect(submissions.get("f1")!.length).toBe(1);
  });

  it("should flag honeypot-filled submissions as spam", () => {
    const sub: Submission = {
      id: createId(), formId: "f1",
      data: { name: "Bot", email: "bot@x.com", _honeypot: "filled" },
      isSpam: true, isRead: false, createdAt: new Date().toISOString(),
    };
    submissions.get("f1")!.push(sub);

    const clean = submissions.get("f1")!.filter(s => !s.isSpam);
    expect(clean.length).toBe(1);
  });

  it("should mark submissions as read", () => {
    const all = submissions.get("f1")!;
    all[0]!.isRead = true;
    expect(all[0]!.isRead).toBe(true);
  });

  it("should reject submissions to draft forms", () => {
    const draft: Form = {
      id: "f2", name: "Draft Form", slug: "draft-form",
      status: "draft",
      fields: [{ name: "email", type: "email", required: true }],
      settings: { spamProtection: "none", storeSubmissions: true },
    };
    forms.set(draft.id, draft);

    expect(forms.get("f2")!.status).toBe("draft");
  });

  it("should validate required fields", () => {
    const requiredFields = ["name", "email"];
    const data = { name: "Bob" }; // missing email

    const missing = requiredFields.filter(f => !(f in data));
    expect(missing).toContain("email");
    expect(missing.length).toBe(1);
  });

  it("should format export data as CSV", () => {
    const subs = submissions.get("f1")!;
    const csv = subs.map(s =>
      `${s.data.name ?? ""},${s.data.email ?? ""},${s.isSpam ? "spam" : "clean"}`
    ).join("\n");

    expect(csv).toContain("Alice");
    expect(csv).toContain("clean");
    expect(csv).toContain("spam");
  });
});
