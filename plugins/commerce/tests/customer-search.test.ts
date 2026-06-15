import { describe, it, expect } from "vitest";
interface Customer { id: string; name: string; email: string; orders: number; }
describe("Customer Search", () => {
  const customers: Customer[] = [{id:"c1",name:"Alice",email:"a@b.com",orders:5},{id:"c2",name:"Bob",email:"b@c.com",orders:2}];
  function search(q: string): Customer[] { const lq = q.toLowerCase(); return customers.filter(c=>c.name.toLowerCase().includes(lq)||c.email.toLowerCase().includes(lq)); }
  function byOrderCount(min: number): Customer[] { return customers.filter(c=>c.orders>=min); }
  it("should search by name", () => { expect(search("alice").length).toBe(1); });
  it("should search by email", () => { expect(search("b@c").length).toBe(1); });
  it("should filter by order count", () => { expect(byOrderCount(3).length).toBe(1); });
});
