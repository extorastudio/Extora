import { describe, it, expect } from "vitest";

interface Category {
  id: string; name: string; slug: string; parentId?: string; children?: Category[];
}

describe("Category Tree", () => {
  const categories: Category[] = [
    { id: "1", name: "Electronics", slug: "electronics" },
    { id: "2", name: "Computers", slug: "computers", parentId: "1" },
    { id: "3", name: "Laptops", slug: "laptops", parentId: "2" },
    { id: "4", name: "Desktops", slug: "desktops", parentId: "2" },
    { id: "5", name: "Phones", slug: "phones", parentId: "1" },
  ];

  function buildTree(items: Category[]): Category[] {
    const map = new Map<string, Category>();
    const roots: Category[] = [];
    for (const item of items) {
      map.set(item.id, { ...item, children: [] });
    }
    for (const item of map.values()) {
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent?.children) parent.children.push(item);
      } else {
        roots.push(item);
      }
    }
    return roots;
  }

  it("should build category tree", () => {
    const tree = buildTree(categories);
    expect(tree.length).toBe(1);
    expect(tree[0]!.name).toBe("Electronics");
  });

  it("should have nested children", () => {
    const tree = buildTree(categories);
    const computers = tree[0]!.children!.find(c => c.name === "Computers");
    expect(computers!.children!.length).toBe(2);
  });

  it("should find leaf categories", () => {
    const tree = buildTree(categories);
    const computers = tree[0]!.children!.find(c => c.name === "Computers")!;
    const leaves = computers.children!.filter(c => !c.children || c.children.length === 0);
    expect(leaves.length).toBe(2);
  });

  it("should get all descendant IDs", () => {
    function getDescendants(cat: Category): string[] {
      const ids: string[] = [];
      if (cat.children) {
        for (const child of cat.children) {
          ids.push(child.id);
          ids.push(...getDescendants(child));
        }
      }
      return ids;
    }

    const tree = buildTree(categories);
    const all = ["1", ...getDescendants(tree[0]!)];
    expect(all.length).toBe(5);
  });
});
