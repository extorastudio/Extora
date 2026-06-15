import { describe, it, expect } from "vitest";
interface Product { id: string; name: string; price: number; }
describe("Commerce Import/Export", () => {
  const products: Product[] = [{id:"1",name:"A",price:10},{id:"2",name:"B",price:20}];
  function exportCSV(items: Product[]): string { const header = "id,name,price"; return header + "\n" + items.map(i=>`${i.id},${i.name},${i.price}`).join("\n"); }
  function importCSV(csv: string): Product[] { const lines = csv.trim().split("\n").slice(1); return lines.map(l=>{const [id,name,price]=l.split(","); return {id: id!, name: name!, price: Number(price)};}); }
  it("should export to CSV", () => { const csv = exportCSV(products); expect(csv).toContain("id,name,price"); expect(csv).toContain("A,10"); });
  it("should import from CSV", () => { const imported = importCSV("id,name,price\n3,C,30"); expect(imported.length).toBe(1); expect(imported[0]!.name).toBe("C"); });
  it("should round-trip products", () => { const csv = exportCSV(products); const imported = importCSV(csv); expect(imported.length).toBe(2); expect(imported[0]!.price).toBe(10); });
});
