import { describe, it, expect } from "vitest";

interface Redirect { from: string; to: string; statusCode: 301 | 302; isActive: boolean; }

function matchRedirect(path: string, redirects: Redirect[]): Redirect | undefined {
  return redirects.find(r => r.from === path && r.isActive);
}

describe("SEO Redirect Manager", () => {
  const redirects: Redirect[] = [
    { from: "/old-page", to: "/new-page", statusCode: 301, isActive: true },
    { from: "/temp", to: "/new-temp", statusCode: 302, isActive: true },
    { from: "/disabled", to: "/somewhere", statusCode: 301, isActive: false },
  ];

  it("should match 301 redirect", () => {
    const r = matchRedirect("/old-page", redirects);
    expect(r?.statusCode).toBe(301);
    expect(r?.to).toBe("/new-page");
  });

  it("should match 302 redirect", () => {
    const r = matchRedirect("/temp", redirects);
    expect(r?.statusCode).toBe(302);
  });

  it("should not match inactive redirects", () => {
    const r = matchRedirect("/disabled", redirects);
    expect(r).toBeUndefined();
  });

  it("should return undefined for unknown paths", () => {
    expect(matchRedirect("/unknown", redirects)).toBeUndefined();
  });
});
