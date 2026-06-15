import { describe, it, expect } from "vitest";

interface MenuItem { id: string; label: string; url: string; parentId?: string; children?: MenuItem[]; order: number; }

function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const map = new Map<string, MenuItem>();
  const roots: MenuItem[] = [];
  for (const item of items) { map.set(item.id, { ...item, children: [] }); }
  for (const item of map.values()) {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(item);
    } else {
      roots.push(item);
    }
  }
  return roots.sort((a,b) => a.order - b.order);
}

describe("CMS Menu Builder", () => {
  const items: MenuItem[] = [
    { id: "1", label: "Home", url: "/", order: 1 },
    { id: "2", label: "About", url: "/about", order: 2 },
    { id: "3", label: "Team", url: "/about/team", parentId: "2", order: 1 },
  ];

  it("should build menu tree", () => {
    const tree = buildMenuTree(items);
    expect(tree.length).toBe(2);
    expect(tree[1]!.children!.length).toBe(1);
  });
});
