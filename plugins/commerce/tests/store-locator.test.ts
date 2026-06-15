import { describe, it, expect } from "vitest";

interface Store { id: string; name: string; lat: number; lng: number; city: string; isActive: boolean; }

function findNearby(lat: number, lng: number, stores: Store[], radiusKm: number): Store[] {
  return stores.filter(s => {
    const dist = Math.sqrt((s.lat-lat)**2 + (s.lng-lng)**2) * 111;
    return dist <= radiusKm && s.isActive;
  });
}

describe("Commerce Store Locator", () => {
  const stores: Store[] = [
    { id: "s1", name: "Downtown", lat: 34.05, lng: -118.25, city: "LA", isActive: true },
    { id: "s2", name: "Suburb", lat: 34.15, lng: -118.35, city: "LA", isActive: true },
    { id: "s3", name: "Closed", lat: 34.05, lng: -118.25, city: "LA", isActive: false },
  ];

  it("should find nearby stores", () => {
    const nearby = findNearby(34.05, -118.25, stores, 10);
    expect(nearby.length).toBe(1);
    expect(nearby[0]!.name).toBe("Downtown");
  });

  it("should exclude inactive stores", () => {
    const nearby = findNearby(34.05, -118.25, stores, 10);
    expect(nearby.some(s => !s.isActive)).toBe(false);
  });

  it("should return empty for distant location", () => {
    const nearby = findNearby(40.71, -74.00, stores, 5);
    expect(nearby.length).toBe(0);
  });
});
