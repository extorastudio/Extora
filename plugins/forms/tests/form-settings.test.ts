import { describe, it, expect } from "vitest";

interface FormSettings {
  submitButtonText: string; successMessage: string; sendEmail: boolean;
  emailTo: string[]; storeSubmissions: boolean; spamProtection: "honeypot"|"recaptcha"|"none";
  maxSubmissions?: number; closeDate?: string;
}

function isFormAccepting(settings: FormSettings, currentSubmissions: number): boolean {
  if (settings.maxSubmissions && currentSubmissions >= settings.maxSubmissions) return false;
  if (settings.closeDate && new Date(settings.closeDate) < new Date()) return false;
  return true;
}

describe("Forms Settings", () => {
  const settings: FormSettings = {
    submitButtonText: "Send", successMessage: "Thanks!",
    sendEmail: true, emailTo: ["admin@test.com"],
    storeSubmissions: true, spamProtection: "honeypot",
  };

  it("should accept submissions within limits", () => {
    expect(isFormAccepting(settings, 5)).toBe(true);
  });

  it("should reject when max submissions reached", () => {
    const limited: FormSettings = { ...settings, maxSubmissions: 10 };
    expect(isFormAccepting(limited, 10)).toBe(false);
  });

  it("should reject after close date", () => {
    const closed: FormSettings = { ...settings, closeDate: "2024-01-01" };
    expect(isFormAccepting(closed, 1)).toBe(false);
  });

  it("should accept when no limits set", () => {
    expect(isFormAccepting(settings, 999)).toBe(true);
  });
});
