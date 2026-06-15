import { describe, it, expect } from "vitest";

interface FunnelStep { name: string; requiredEvent: string; }

function calculateFunnel(events: string[], steps: FunnelStep[]): Array<{ step: string; count: number; dropoff: number }> {
  const result: Array<{ step: string; count: number; dropoff: number }> = [];
  let prevCount = events.length;
  for (const step of steps) {
    const count = events.filter(e => e === step.requiredEvent).length;
    result.push({ step: step.name, count, dropoff: prevCount - count });
  }
  return result;
}

describe("Analytics Funnel", () => {
  it("should calculate funnel steps", () => {
    const events = ["page_view", "page_view", "page_view", "add_to_cart", "add_to_cart", "purchase"];
    const steps: FunnelStep[] = [
      { name: "Visits", requiredEvent: "page_view" },
      { name: "Add to Cart", requiredEvent: "add_to_cart" },
      { name: "Purchase", requiredEvent: "purchase" },
    ];
    const funnel = calculateFunnel(events, steps);
    expect(funnel[0]!.count).toBe(3);
    expect(funnel[1]!.count).toBe(2);
    expect(funnel[2]!.count).toBe(1);
  });
});
