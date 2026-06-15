import { describe, it, expect, beforeEach } from "vitest";
import type {
  PaymentGatewayPlugin,
  ShippingProviderPlugin,
  TaxProviderPlugin,
} from "../src/extensions";
import { CommerceExtensionRegistry } from "../src/extensions";

function createMockPaymentGw(): PaymentGatewayPlugin {
  return {
    id: "stripe",
    name: "Stripe",
    supportedCurrencies: ["USD"],
    supportedMethods: ["card"],
    async createPaymentIntent(order) {
      return {
        id: `pi_${order.id}`,
        clientSecret: `cs_${order.id}`,
        amount: order.amount,
        currency: order.currency,
        status: "requires_payment_method",
      };
    },
    async capturePayment(txId) {
      return { success: true, transactionId: txId, status: "captured" };
    },
    async refundPayment(txId, amount) {
      return { success: true, refundId: `rf_${txId}`, amount: amount ?? 0 };
    },
    async handleWebhook() {
      return { received: true, event: "payment_intent.succeeded" };
    },
  };
}

function createMockShipping(): ShippingProviderPlugin {
  return {
    id: "fedex",
    name: "FedEx",
    async getRates(_, items) {
      const weight = items.reduce((sum: number, i) => sum + (i.weight ?? 1) * i.quantity, 0);
      return [
        { id: "standard", provider: "fedex", serviceName: "Standard", price: 5.99, currency: "USD", estimatedDays: 5, isTracked: true },
        { id: "express", provider: "fedex", serviceName: "Express", price: 15.99, currency: "USD", estimatedDays: 2, isTracked: true },
      ];
    },
    async createShipment(req) {
      return {
        id: `ship_${req.orderId}`,
        trackingNumber: `TRACK_${req.orderId}`,
        trackingUrl: `https://track.example.com/TRACK_${req.orderId}`,
        status: "created",
      };
    },
    async getTracking(tn) {
      return {
        trackingNumber: tn,
        status: "in_transit",
        events: [{ timestamp: new Date(), location: "Hub", description: "In transit" }],
      };
    },
    async cancelShipment() { return true; },
    async validateAddress() { return { valid: true }; },
  };
}

function createMockTax(): TaxProviderPlugin {
  return {
    id: "taxjar",
    name: "TaxJar",
    async calculateTax() {
      return {
        id: "tax_calc_1",
        provider: "taxjar",
        totalTax: 8.25,
        currency: "USD",
        breakdown: [
          { name: "State Tax", rate: 6.0, taxableAmount: 100, taxAmount: 6.0, jurisdiction: "CA" },
          { name: "City Tax", rate: 2.25, taxableAmount: 100, taxAmount: 2.25, jurisdiction: "LA" },
        ],
        taxedAt: new Date(),
      };
    },
    async validateAddress() { return { valid: true }; },
    async getTaxRate() { return { rate: 8.25, name: "CA State" }; },
    async commitTax() { return { committed: true }; },
    async refundTax(_, amount) { return { refunded: true, refundAmount: amount ?? 0 }; },
  };
}

describe("Commerce Checkout Integration", () => {
  let registry: CommerceExtensionRegistry;
  let paymentGw: PaymentGatewayPlugin;
  let shipping: ShippingProviderPlugin;
  let tax: TaxProviderPlugin;

  beforeEach(() => {
    registry = new CommerceExtensionRegistry();
    paymentGw = createMockPaymentGw();
    shipping = createMockShipping();
    tax = createMockTax();
    registry.registerPaymentGateway(paymentGw);
    registry.registerShippingProvider(shipping);
    registry.registerTaxProvider(tax);
  });

  it("should calculate tax for an order", async () => {
    const origin = { name: "Store", line1: "123 St", city: "SF", state: "CA", postalCode: "94101", country: "US" };
    const dest = { name: "Customer", line1: "456 Rd", city: "LA", state: "CA", postalCode: "90001", country: "US" };
    const items = [{ id: "1", name: "Widget", sku: "W-001", quantity: 2, unitPrice: 50, totalPrice: 100, taxCode: "P0001", isPhysical: true }];

    const result = await tax.calculateTax(origin, dest, items);
    expect(result.totalTax).toBe(8.25);
    expect(result.breakdown.length).toBe(2);
    expect(result.currency).toBe("USD");
  });

  it("should get available shipping rates", async () => {
    const dest = { name: "Customer", line1: "456 Rd", city: "LA", state: "CA", postalCode: "90001", country: "US" };
    const items = [{ name: "Widget", sku: "W-001", quantity: 2, weight: 0.5 }];

    const rates = await shipping.getRates(dest, items);
    expect(rates.length).toBe(2);
    expect(rates[0]!.serviceName).toBe("Standard");
    expect(rates[1]!.serviceName).toBe("Express");
    expect(rates[1]!.price).toBeGreaterThan(rates[0]!.price);
  });

  it("should create and capture payment", async () => {
    const order = {
      id: "order_1",
      orderNumber: "EXT-0001",
      amount: 118.24,
      currency: "usd",
      customerEmail: "test@example.com",
    };

    const intent = await paymentGw.createPaymentIntent(order);
    expect(intent.id).toBe("pi_order_1");
    expect(intent.status).toBe("requires_payment_method");

    const capture = await paymentGw.capturePayment(intent.id);
    expect(capture.success).toBe(true);
    expect(capture.status).toBe("captured");
  });

  it("should create shipment with tracking", async () => {
    const request = {
      orderId: "order_1",
      orderNumber: "EXT-0001",
      rateId: "express",
      destination: { name: "Customer", line1: "456 Rd", city: "LA", state: "CA", postalCode: "90001", country: "US" },
      items: [{ name: "Widget", sku: "W-001", quantity: 2 }],
    };

    const shipment = await shipping.createShipment(request);
    expect(shipment.trackingNumber).toBe("TRACK_order_1");
    expect(shipment.status).toBe("created");

    const tracking = await shipping.getTracking(shipment.trackingNumber);
    expect(tracking.status).toBe("in_transit");
  });

  it("should handle full checkout flow: tax → shipping → payment → capture", async () => {
    const origin = { name: "Store", line1: "123 St", city: "SF", state: "CA", postalCode: "94101", country: "US" };
    const dest = { name: "Customer", line1: "456 Rd", city: "LA", state: "CA", postalCode: "90001", country: "US" };
    const items = [{ id: "1", name: "Widget", sku: "W-001", quantity: 2, unitPrice: 50, totalPrice: 100, taxCode: "P0001", isPhysical: true }];

    // Step 1: Calculate tax
    const taxResult = await tax.calculateTax(origin, dest, items);
    expect(taxResult.totalTax).toBe(8.25);

    // Step 2: Get shipping rates
    const shipItems = [{ name: "Widget", sku: "W-001", quantity: 2, weight: 0.5 }];
    const rates = await shipping.getRates(dest, shipItems);
    const selectedRate = rates[1]!;

    // Step 3: Calculate total
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const grandTotal = subtotal + taxResult.totalTax + selectedRate.price;

    // Step 4: Create payment
    const payment = await paymentGw.createPaymentIntent({
      id: "order_final",
      orderNumber: "EXT-FINAL",
      amount: grandTotal,
      currency: "USD",
      customerEmail: "test@example.com",
      customerName: "Test User",
      description: "Widget x2",
    });
    expect(payment.amount).toBe(grandTotal);

    // Step 5: Capture payment
    const capture = await paymentGw.capturePayment(payment.id);
    expect(capture.success).toBe(true);

    // Step 6: Create shipment
    const shipment = await shipping.createShipment({
      orderId: "order_final",
      orderNumber: "EXT-FINAL",
      rateId: selectedRate.id,
      destination: dest,
      items: shipItems,
      weight: 1,
    });
    expect(shipment.trackingNumber).toBeTruthy();
    expect(shipment.status).toBe("created");

    // Step 7: Refund
    const refund = await paymentGw.refundPayment(payment.id, grandTotal);
    expect(refund.success).toBe(true);
  });

  it("should handle tax commit and refund", async () => {
    const commit = await tax.commitTax("tax_calc_1");
    expect(commit.committed).toBe(true);

    const refund = await tax.refundTax("tax_calc_1", 8.25);
    expect(refund.refunded).toBe(true);
    expect(refund.refundAmount).toBe(8.25);
  });

  it("should validate addresses", async () => {
    const address = { name: "Test", line1: "123 Main", city: "Test", postalCode: "12345", country: "US" };
    const shipResult = await shipping.validateAddress(address);
    expect(shipResult.valid).toBe(true);

    const taxResult = await tax.validateAddress(address);
    expect(taxResult.valid).toBe(true);
  });
});
