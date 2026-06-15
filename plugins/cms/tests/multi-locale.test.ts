import { describe, it, expect } from "vitest";
interface LocaleEntry { id: string; locale: string; data: Record<string,unknown>; }
describe("CMS Multi-Locale", () => {
  const entries: LocaleEntry[] = [];
  function addLocale(id: string, locale: string, data: Record<string,unknown>) { entries.push({ id, locale, data }); }
  function getByLocale(id: string, locale: string): LocaleEntry|undefined { return entries.find(e => e.id===id && e.locale===locale); }
  it("should store multiple locales", () => { addLocale("p1", "en", { title: "Hello" }); addLocale("p1", "fr", { title: "Bonjour" }); expect(entries.length).toBe(2); });
  it("should retrieve by locale", () => { expect(getByLocale("p1", "fr")?.data.title).toBe("Bonjour"); });
  it("should return undefined for missing locale", () => { expect(getByLocale("p1", "es")).toBeUndefined(); });
});
