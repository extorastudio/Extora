import { describe, it, expect, beforeEach } from "vitest";
import { TenantManager } from "../src/tenant-manager";

describe("TenantManager", () => {
  let tm: TenantManager;
  beforeEach(() => { tm = new TenantManager(); });

  it("should create tenant", () => {
    const r = tm.createTenant("Test Org", "test.extora.dev", "professional");
    expect(r.success).toBe(true);
    expect(r.dbSchema).toContain("_db");
  });

  it("should reject duplicate domain", () => {
    tm.createTenant("A", "dupe.dev");
    const r = tm.createTenant("B", "dupe.dev");
    expect(r.success).toBe(false);
  });

  it("should suspend and resume tenant", () => {
    const r = tm.createTenant("Org", "org.dev");
    expect(tm.suspendTenant(r.tenantId!)).toBe(true);
    expect(tm.getTenant(r.tenantId!)!.status).toBe("suspended");
    expect(tm.resumeTenant(r.tenantId!)).toBe(true);
    expect(tm.getTenant(r.tenantId!)!.status).toBe("active");
  });

  it("should delete tenant", () => {
    const r = tm.createTenant("Del", "del.dev");
    expect(tm.deleteTenant(r.tenantId!)).toBe(true);
    expect(tm.getTenant(r.tenantId!)!.status).toBe("deleted");
  });

  it("should list tenants by status", () => {
    const a = tm.createTenant("A", "a.dev");
    const b = tm.createTenant("B", "b.dev");
    tm.suspendTenant(b.tenantId!);
    expect(tm.listTenants("active").length).toBe(1);
  });

  it("should report tenant stats", () => {
    tm.createTenant("A", "a1.dev", "starter");
    tm.createTenant("B", "a2.dev", "business");
    tm.createTenant("C", "a3.dev", "enterprise");
    const stats = tm.getStats();
    expect(stats.total).toBe(3);
    expect(stats.byPlan["starter"]).toBe(1);
    expect(stats.byPlan["enterprise"]).toBe(1);
  });

  it("should find tenant by domain", () => {
    tm.createTenant("Search", "find.me");
    const t = tm.getTenantByDomain("find.me");
    expect(t?.name).toBe("Search");
  });
});
