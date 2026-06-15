/**
 * Extora Cloud — Multi-Tenant Provisioning Module
 *
 * Manages tenant lifecycle: create, suspend, resume, delete.
 * Each tenant gets isolated resources (DB schema, storage bucket).
 */

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: "active" | "suspended" | "deleted";
  plan: "starter" | "professional" | "business" | "scale" | "enterprise";
  dbSchema: string;
  storageBucket: string;
  createdAt: string;
  updatedAt: string;
}

interface TenantProvisioningResult {
  success: boolean;
  tenantId?: string;
  error?: string;
  dbSchema?: string;
  storageBucket?: string;
}

class TenantManager {
  private tenants = new Map<string, Tenant>();
  private sequence = 1000;

  createTenant(
    name: string,
    domain: string,
    plan: Tenant["plan"] = "starter",
  ): TenantProvisioningResult {
    if (Array.from(this.tenants.values()).find((t) => t.domain === domain)) {
      return { success: false, error: `Domain "${domain}" already taken` };
    }

    const id = `tenant_${String(++this.sequence)}`;
    const dbSchema = `${id}_db`;
    const storageBucket = `${id}_storage`;

    const tenant: Tenant = {
      id,
      name,
      domain,
      status: "active",
      plan,
      dbSchema,
      storageBucket,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tenants.set(id, tenant);

    return {
      success: true,
      tenantId: id,
      dbSchema,
      storageBucket,
    };
  }

  suspendTenant(id: string): boolean {
    const tenant = this.tenants.get(id);
    if (!tenant) return false;
    tenant.status = "suspended";
    tenant.updatedAt = new Date().toISOString();
    return true;
  }

  resumeTenant(id: string): boolean {
    const tenant = this.tenants.get(id);
    if (!tenant || tenant.status !== "suspended") return false;
    tenant.status = "active";
    tenant.updatedAt = new Date().toISOString();
    return true;
  }

  deleteTenant(id: string): boolean {
    const tenant = this.tenants.get(id);
    if (!tenant) return false;
    tenant.status = "deleted";
    tenant.updatedAt = new Date().toISOString();
    return true;
  }

  getTenant(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  getTenantByDomain(domain: string): Tenant | undefined {
    return Array.from(this.tenants.values()).find((t) => t.domain === domain);
  }

  listTenants(status?: Tenant["status"]): Tenant[] {
    const all = Array.from(this.tenants.values());
    return status ? all.filter((t) => t.status === status) : all;
  }

  getStats(): { total: number; active: number; suspended: number; byPlan: Record<string, number> } {
    const all = Array.from(this.tenants.values());
    const byPlan: Record<string, number> = {};

    for (const t of all) {
      byPlan[t.plan] = (byPlan[t.plan] ?? 0) + 1;
    }

    return {
      total: all.length,
      active: all.filter((t) => t.status === "active").length,
      suspended: all.filter((t) => t.status === "suspended").length,
      byPlan,
    };
  }
}

export { TenantManager };
export type { Tenant, TenantProvisioningResult };
