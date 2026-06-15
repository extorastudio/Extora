import { describe, it, expect, beforeEach } from "vitest";
import { CommerceExtensionRegistry } from "../src/extensions";
import type { PaymentGatewayPlugin, ShippingProviderPlugin, TaxProviderPlugin } from "../src/extensions";

function createMockPaymentGateway(id: string): PaymentGatewayPlugin {
  return {
    id,
    name: `${id} Gateway`,
    supportedCurrencies: ["USD"],
    supportedMethods: ["card"],
    createPaymentIntent: async () => ({
      id: "pi_123",
      clientSecret: "cs_abc",
      amount: 1000,
      currency: "usd",
      status: "requires_payment_method",
    }),
    capturePayment: async () => ({
      success: true,
      transactionId: "tx_123",
      status: "captured",
    }),
    refundPayment: async () => ({
      success: true,
      refundId: "rf_123",
      amount: 1000,
    }),
    handleWebhook: async () => ({
      received: true,
      event: "payment_intent.succeeded",
      transactionId: "tx_123",
    }),
  };
}

function createMockShippingProvider(id: string): ShippingProviderPlugin {
  return {
    id,
    name: `${id} Shipping`,
    getRates: async () => [
      {
        id: "rate_1",
        provider: id,
        serviceName: "Standard",
        price: 9.99,
        currency: "USD",
        estimatedDays: 5,
        isTracked: true,
      },
    ],
    createShipment: async () => ({
      id: "ship_1",
      trackingNumber: "TRACK123",
      trackingUrl: "https://track.example.com/TRACK123",
      status: "created",
    }),
    getTracking: async () => ({
      trackingNumber: "TRACK123",
      status: "in_transit",
      events: [{ timestamp: new Date(), location: "Warehouse", description: "Package picked up" }],
    }),
    cancelShipment: async () => true,
    validateAddress: async () => ({ valid: true }),
  };
}

function createMockTaxProvider(id: string): TaxProviderPlugin {
  return {
    id,
    name: `${id} Tax`,
    calculateTax: async () => ({
      id: "tax_1",
      provider: id,
      totalTax: 8.25,
      currency: "USD",
      breakdown: [
        { name: "State Tax", rate: 6.0, taxableAmount: 100, taxAmount: 6.0, jurisdiction: "CA" },
        { name: "City Tax", rate: 2.25, taxableAmount: 100, taxAmount: 2.25, jurisdiction: "Los Angeles" },
      ],
      taxedAt: new Date(),
    }),
    validateAddress: async () => ({ valid: true }),
    getTaxRate: async () => ({ rate: 8.25, name: "CA + LA" }),
    commitTax: async () => ({ committed: true }),
    refundTax: async () => ({ refunded: true, refundAmount: 8.25 }),
  };
}

describe("CommerceExtensionRegistry", () => {
  let registry: CommerceExtensionRegistry;

  beforeEach(() => {
    registry = new CommerceExtensionRegistry();
  });

  describe("Payment Gateways", () => {
    it("should register and retrieve payment gateways", () => {
      const gateway = createMockPaymentGateway("stripe");
      registry.registerPaymentGateway(gateway);
      expect(registry.getPaymentGateway("stripe")).toBe(gateway);
    });

    it("should list all registered payment gateways", () => {
      registry.registerPaymentGateway(createMockPaymentGateway("stripe"));
      registry.registerPaymentGateway(createMockPaymentGateway("paypal"));
      expect(registry.getAllPaymentGateways()).toHaveLength(2);
    });

    it("should return undefined for unregistered gateway", () => {
      expect(registry.getPaymentGateway("unknown")).toBeUndefined();
    });

    it("should create payment intent via registered gateway", async () => {
      const gateway = createMockPaymentGateway("stripe");
      registry.registerPaymentGateway(gateway);

      const result = await gateway.createPaymentIntent({
        id: "order_1",
        orderNumber: "EXT-0001",
        amount: 1000,
        currency: "usd",
        customerEmail: "test@example.com",
      });

      expect(result.id).toBe("pi_123");
      expect(result.status).toBe("requires_payment_method");
    });
  });

  describe("Shipping Providers", () => {
    it("should register and retrieve shipping providers", () => {
      const provider = createMockShippingProvider("fedex");
      registry.registerShippingProvider(provider);
      expect(registry.getShippingProvider("fedex")).toBe(provider);
    });

    it("should list all shipping providers", () => {
      registry.registerShippingProvider(createMockShippingProvider("fedex"));
      registry.registerShippingProvider(createMockShippingProvider("ups"));
      expect(registry.getAllShippingProviders()).toHaveLength(2);
    });

    it("should get shipping rates", async () => {
      const provider = createMockShippingProvider("fedex");
      const rates = await provider.getRates(
        { name: "Test", line1: "123 Main St", city: "LA", state: "CA", postalCode: "90001", country: "US" },
        [{ name: "Widget", sku: "W-001", quantity: 2 }],
      );
      expect(rates).toHaveLength(1);
      expect(rates[0]!.serviceName).toBe("Standard");
    });
  });

  describe("Tax Providers", () => {
    it("should register and retrieve tax providers", () => {
      const provider = createMockTaxProvider("taxjar");
      registry.registerTaxProvider(provider);
      expect(registry.getTaxProvider("taxjar")).toBe(provider);
    });

    it("should calculate tax", async () => {
      const provider = createMockTaxProvider("taxjar");
      const result = await provider.calculateTax(
        { name: "Store", line1: "456 Shop St", city: "SF", state: "CA", postalCode: "94101", country: "US" },
        { name: "Customer", line1: "789 Home St", city: "LA", state: "CA", postalCode: "90001", country: "US" },
        [{ id: "1", name: "Widget", sku: "W-001", quantity: 1, unitPrice: 100, totalPrice: 100, taxCode: "P0001", isPhysical: true }],
      );
      expect(result.totalTax).toBe(8.25);
      expect(result.breakdown).toHaveLength(2);
    });

    it("should commit and refund tax", async () => {
      const provider = createMockTaxProvider("taxjar");
      const commitResult = await provider.commitTax("tax_1");
      expect(commitResult.committed).toBe(true);

      const refundResult = await provider.refundTax("tax_1", 8.25);
      expect(refundResult.refunded).toBe(true);
    });
  });

  describe("Full Commerce Flow", () => {
    it("should handle payment + shipping + tax flow", async () => {
      const paymentGw = createMockPaymentGateway("stripe");
      const shipping = createMockShippingProvider("fedex");
      const tax = createMockTaxProvider("taxjar");

      registry.registerPaymentGateway(paymentGw);
      registry.registerShippingProvider(shipping);
      registry.registerTaxProvider(tax);

      // Tax calculation
      const taxResult = await tax.calculateTax(
        { name: "Store", line1: "456 St", city: "SF", state: "CA", postalCode: "94101", country: "US" },
        { name: "Cust", line1: "789 Rd", city: "LA", state: "CA", postalCode: "90001", country: "US" },
        [{ id: "1", name: "Item", sku: "SKU", quantity: 1, unitPrice: 100, totalPrice: 100, taxCode: "P0001", isPhysical: true }],
      );
      expect(taxResult.totalTax).toBe(8.25);

      // Shipping rates
      const rates = await shipping.getRates(
        { name: "Cust", line1: "789 Rd", city: "LA", state: "CA", postalCode: "90001", country: "US" },
        [{ name: "Item", sku: "SKU", quantity: 1 }],
      );
      expect(rates).toHaveLength(1);

      // Payment
      const payment = await paymentGw.createPaymentIntent({
        id: "order_1",
        orderNumber: "EXT-0001",
        amount: 100 + taxResult.totalTax + rates[0]!.price,
        currency: "usd",
        customerEmail: "test@example.com",
      });
      expect(payment.id).toBe("pi_123");

      // Capture
      const capture = await paymentGw.capturePayment(payment.id);
      expect(capture.success).toBe(true);
    });
  });
});
