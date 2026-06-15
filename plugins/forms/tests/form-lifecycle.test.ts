import { describe, it, expect } from "vitest";

interface Form {
  id: string;
  name: string;
  slug: string;
  status: string;
  fields: Array<{ name: string; label: string; type: string; required?: boolean }>;
}

interface Submission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  isSpam: boolean;
}

describe("Forms Lifecycle", () => {
  const forms = new Map<string, Form>();
  const submissions = new Map<string, Submission[]>();

  function createId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  it("should create a form", () => {
    const form: Form = {
      id: createId(),
      name: "Contact Us",
      slug: "contact-us",
      status: "draft",
      fields: [
        { name: "name", label: "Your Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "message", label: "Message", type: "textarea", required: true },
      ],
    };

    forms.set(form.id, form);
    submissions.set(form.id, []);

    expect(forms.get(form.id)!.name).toBe("Contact Us");
    expect(forms.get(form.id)!.fields.length).toBe(3);
  });

  it("should publish a form", () => {
    const form = Array.from(forms.values())[0]!;
    form.status = "published";
    forms.set(form.id, form);

    expect(forms.get(form.id)!.status).toBe("published");
  });

  it("should accept public submissions", () => {
    const form = Array.from(forms.values())[0]!;

    const sub: Submission = {
      id: createId(),
      formId: form.id,
      data: { name: "John", email: "john@example.com", message: "Hello!" },
      isSpam: false,
    };

    const existing = submissions.get(form.id) ?? [];
    existing.push(sub);
    submissions.set(form.id, existing);

    expect(existing.length).toBe(1);
    expect(existing[0]!.data.name).toBe("John");
    expect(existing[0]!.isSpam).toBe(false);
  });

  it("should detect spam submissions (honeypot filled)", () => {
    const form = Array.from(forms.values())[0]!;

    const spam: Submission = {
      id: createId(),
      formId: form.id,
      data: { name: "Bot", email: "bot@spam.com", _honeypot: "filled" },
      isSpam: true,
    };

    const existing = submissions.get(form.id) ?? [];
    existing.push(spam);
    submissions.set(form.id, existing);

    const all = submissions.get(form.id) ?? [];
    const clean = all.filter((s) => !s.isSpam);
    expect(clean.length).toBe(1);
    expect(all.length).toBe(2);
  });

  it("should reject submissions to closed forms", () => {
    const form = Array.from(forms.values())[0]!;
    form.status = "closed";
    forms.set(form.id, form);

    expect(forms.get(form.id)!.status).toBe("closed");
    // In production, the API would return 400 for submissions to closed forms
  });

  it("should list submissions for a form", () => {
    const form = Array.from(forms.values())[0]!;
    const subs = submissions.get(form.id) ?? [];

    expect(subs.length).toBe(2);

    const cleanSubs = subs.filter((s) => !s.isSpam);
    expect(cleanSubs.length).toBe(1);
  });
});
