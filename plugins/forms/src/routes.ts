import { createRouter } from "@extora/sdk/api";

interface FormDefinition {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "closed";
  fields: FormField[];
  settings: FormSettings;
  createdAt: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  sendEmail: boolean;
  emailTo: string[];
  storeSubmissions: boolean;
  spamProtection: "honeypot" | "recaptcha" | "none";
}

interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  files?: Record<string, unknown>;
  isRead: boolean;
  isSpam: boolean;
  createdAt: string;
}

const forms = new Map<string, FormDefinition>();
const submissions = new Map<string, FormSubmission[]>();

function createId(): string {
  return `form_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// =========================================================================
// Form Management Routes
// =========================================================================

export function createFormRouter() {
  return createRouter("forms")
    .get("/api/v1/forms", async () => ({
      data: Array.from(forms.values()),
    }))
    .get("/api/v1/forms/:id", async (req) => {
      const id = ((req as unknown as Record<string, unknown>).params as Record<string, string>).id ?? "";
      const form = forms.get(id);
      if (!form) throw httpError(404, "Form not found");
      return { data: form };
    })
    .post("/api/v1/forms", async (req) => {
      const body = (req as unknown as Record<string, unknown>).body as Record<string, unknown>;
      const id = createId();
      const form: FormDefinition = {
        id,
        name: (body.name as string) ?? "Untitled Form",
        slug: (body.slug as string) ?? id,
        status: "draft",
        fields: (body.fields as FormField[]) ?? [],
        settings: (body.settings as FormSettings) ?? {
          submitButtonText: "Submit",
          successMessage: "Thank you!",
          sendEmail: false,
          emailTo: [],
          storeSubmissions: true,
          spamProtection: "honeypot",
        },
        createdAt: new Date().toISOString(),
      };
      forms.set(id, form);
      submissions.set(id, []);
      return { data: form };
    });
}

// =========================================================================
// Form Submission Routes
// =========================================================================

export function createSubmissionRouter() {
  return createRouter("forms")
    .get("/api/v1/forms/:id/submissions", async (req) => {
      const id = ((req as unknown as Record<string, unknown>).params as Record<string, string>).id ?? "";
      const subs = submissions.get(id) ?? [];
      return {
        data: subs.filter((s) => !s.isSpam),
        total: subs.length,
      };
    })
    .get("/api/v1/forms/:id/submissions/:sid", async (req) => {
      const params = (req as unknown as Record<string, unknown>).params as Record<string, string>;
      const formId = params.id ?? "";
      const submissionId = params.sid ?? "";
      const subs = submissions.get(formId) ?? [];
      const sub = subs.find((s) => s.id === submissionId);
      if (!sub) throw httpError(404, "Submission not found");
      return { data: sub };
    })
    .post("/api/v1/forms/:slug/submit", async (req) => {
      const slug = ((req as unknown as Record<string, unknown>).params as Record<string, string>).slug ?? "";
      const body = (req as unknown as Record<string, unknown>).body as Record<string, unknown>;

      const form = Array.from(forms.values()).find((f) => f.slug === slug);
      if (!form) throw httpError(404, "Form not found");
      if (form.status === "closed") throw httpError(400, "Form is closed");

      const sub: FormSubmission = {
        id: createId(),
        formId: form.id,
        data: body,
        files: body._files as Record<string, unknown> | undefined,
        isRead: false,
        isSpam: false,
        createdAt: new Date().toISOString(),
      };

      const formSubs = submissions.get(form.id) ?? [];
      formSubs.push(sub);
      submissions.set(form.id, formSubs);

      return {
        success: true,
        message: form.settings.successMessage,
        submissionId: sub.id,
      };
    })
    .delete("/api/v1/forms/:id/submissions/:sid", async (req) => {
      const params = (req as unknown as Record<string, unknown>).params as Record<string, string>;
      const formId = params.id ?? "";
      const submissionId = params.sid ?? "";

      const subs = submissions.get(formId) ?? [];
      submissions.set(formId, subs.filter((s) => s.id !== submissionId));

      return { data: { deleted: true } };
    });
}

function httpError(statusCode: number, message: string): Error {
  return Object.assign(new Error(message), { statusCode });
}
