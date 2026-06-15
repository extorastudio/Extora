import { describe, it, expect } from "vitest";

interface EmailTemplate { subject: string; body: string; recipient: string; type: string; }

function generateOrderConfirmation(orderNumber: string, customerName: string, total: number, items: Array<{name:string;qty:number}>): EmailTemplate {
  const itemList = items.map(i => `- ${i.name} x${i.qty}`).join("\n");
  return {
    subject: `Order ${orderNumber} Confirmed`,
    body: `Hi ${customerName},\n\nYour order ${orderNumber} has been confirmed.\n\nItems:\n${itemList}\n\nTotal: $${total.toFixed(2)}\n\nThank you for your order!`,
    recipient: "customer@example.com",
    type: "order_confirmation",
  };
}

function generateShipmentNotification(orderNumber: string, trackingNumber: string, carrier: string): EmailTemplate {
  return {
    subject: `Order ${orderNumber} Shipped`,
    body: `Your order ${orderNumber} has shipped via ${carrier}.\n\nTracking: ${trackingNumber}`,
    recipient: "customer@example.com",
    type: "shipment",
  };
}

describe("Commerce Email Notifications", () => {
  it("should generate order confirmation email", () => {
    const email = generateOrderConfirmation("EXT-1001", "Alice", 99.98, [
      { name: "Widget", qty: 2 },
    ]);
    expect(email.subject).toContain("EXT-1001");
    expect(email.body).toContain("Alice");
    expect(email.body).toContain("$99.98");
    expect(email.type).toBe("order_confirmation");
  });

  it("should generate shipment notification", () => {
    const email = generateShipmentNotification("EXT-1001", "TRACK123", "FedEx");
    expect(email.subject).toContain("Shipped");
    expect(email.body).toContain("FedEx");
    expect(email.body).toContain("TRACK123");
  });

  it("should include multiple items in confirmation", () => {
    const email = generateOrderConfirmation("EXT-1002", "Bob", 150, [
      { name: "A", qty: 1 },
      { name: "B", qty: 3 },
    ]);
    expect(email.body).toContain("A x1");
    expect(email.body).toContain("B x3");
  });
});
