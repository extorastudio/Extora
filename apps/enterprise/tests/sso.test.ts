import { describe, it, expect } from "vitest";
import { createSSOConfig, addProvider } from "../src/sso";

describe("Enterprise SSO", () => {
  it("should create empty config", () => {
    const c = createSSOConfig();
    expect(c.providers.length).toBe(0);
    expect(c.enforceSSO).toBe(false);
  });

  it("should add SAML provider", () => {
    let c = createSSOConfig();
    c = addProvider(c, { id:"saml1", name:"Okta", type:"saml", issuerUrl:"https://okta.com", cert:"cert123", isActive: true });
    expect(c.providers.length).toBe(1);
    expect(c.providers[0]!.type).toBe("saml");
  });
});
