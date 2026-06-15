/**
 * Extora Commerce — Extension Interfaces
 *
 * Third-party plugin developers implement these interfaces to provide
 * payment gateways, shipping providers, and tax calculation services.
 */

// =========================================================================
// Payment Gateway Interface
// =========================================================================

interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: "requires_payment_method" | "requires_confirmation" | "succeeded";
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: "authorized" | "captured" | "failed";
  errorMessage?: string;
}

interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  errorMessage?: string;
}

export interface PaymentGatewayPlugin {
  /** Unique identifier for this gateway */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Supported currencies (ISO 4217) */
  readonly supportedCurrencies: string[];

  /** Supported payment methods */
  readonly supportedMethods: PaymentMethod[];

  /** Create a payment intent for an order */
  createPaymentIntent(order: PaymentOrder): Promise<PaymentIntent>;

  /** Capture an authorized payment */
  capturePayment(transactionId: string, amount?: number): Promise<PaymentResult>;

  /** Refund a captured payment */
  refundPayment(transactionId: string, amount?: number): Promise<RefundResult>;

  /** Handle incoming webhook from the payment provider */
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
}

interface PaymentOrder {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  description?: string;
  metadata?: Record<string, string>;
}

type PaymentMethod = "card" | "bank_transfer" | "wallet" | "crypto" | "bnpl";

interface WebhookResult {
  received: boolean;
  event: string;
  transactionId?: string;
  status?: string;
}

// =========================================================================
// Shipping Provider Interface
// =========================================================================

interface ShippingRate {
  id: string;
  provider: string;
  serviceName: string;
  price: number;
  currency: string;
  estimatedDays: number;
  isTracked: boolean;
}

interface ShipmentRequest {
  orderId: string;
  orderNumber: string;
  rateId: string;
  destination: ShippingAddress;
  items: ShipmentItem[];
  weight?: number;
  weightUnit?: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  trackingUrl?: string;
  label?: string;
  status: "created" | "in_transit" | "out_for_delivery" | "delivered" | "exception";
  estimatedDelivery?: Date;
}

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  events: {
    timestamp: Date;
    location: string;
    description: string;
  }[];
  estimatedDelivery?: Date;
}

export interface ShippingProviderPlugin {
  /** Unique identifier */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Get available shipping rates for an order */
  getRates(destination: ShippingAddress, items: ShipmentItem[]): Promise<ShippingRate[]>;

  /** Create a shipment */
  createShipment(request: ShipmentRequest): Promise<Shipment>;

  /** Get tracking information */
  getTracking(trackingNumber: string): Promise<TrackingInfo>;

  /** Cancel a shipment */
  cancelShipment(shipmentId: string): Promise<boolean>;

  /** Validate a shipping address */
  validateAddress(address: ShippingAddress): Promise<AddressValidation>;
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

interface ShipmentItem {
  name: string;
  sku: string;
  quantity: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number; unit: string };
}

interface AddressValidation {
  valid: boolean;
  normalized?: ShippingAddress;
  errors?: string[];
  suggestions?: ShippingAddress[];
}

// =========================================================================
// Tax Provider Interface
// =========================================================================

interface TaxCalculation {
  id: string;
  provider: string;
  totalTax: number;
  currency: string;
  breakdown: TaxBreakdown[];
  taxedAt: Date;
}

interface TaxBreakdown {
  name: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  jurisdiction: string;
}

interface TaxLineItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxCode?: string;
  isPhysical: boolean;
}

export interface TaxProviderPlugin {
  /** Unique identifier */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Calculate tax for an order */
  calculateTax(
    origin: ShippingAddress,
    destination: ShippingAddress,
    items: TaxLineItem[],
    shippingTotal?: number,
  ): Promise<TaxCalculation>;

  /** Validate a shipping address for tax purposes */
  validateAddress(address: ShippingAddress): Promise<AddressValidation>;

  /** Get tax rate for a specific jurisdiction */
  getTaxRate(
    countryCode: string,
    stateCode?: string,
    zipCode?: string,
  ): Promise<{ rate: number; name: string }>;

  /** Commit a tax transaction (finalize) */
  commitTax(transactionId: string): Promise<{ committed: boolean }>;

  /** Refund tax for a transaction */
  refundTax(
    transactionId: string,
    amount?: number,
  ): Promise<{ refunded: boolean; refundAmount: number }>;
}

// =========================================================================
// Commerce Extension Registry
// =========================================================================

export class CommerceExtensionRegistry {
  private paymentGateways = new Map<string, PaymentGatewayPlugin>();
  private shippingProviders = new Map<string, ShippingProviderPlugin>();
  private taxProviders = new Map<string, TaxProviderPlugin>();

  registerPaymentGateway(gateway: PaymentGatewayPlugin): void {
    this.paymentGateways.set(gateway.id, gateway);
  }

  registerShippingProvider(provider: ShippingProviderPlugin): void {
    this.shippingProviders.set(provider.id, provider);
  }

  registerTaxProvider(provider: TaxProviderPlugin): void {
    this.taxProviders.set(provider.id, provider);
  }

  getPaymentGateway(id: string): PaymentGatewayPlugin | undefined {
    return this.paymentGateways.get(id);
  }

  getShippingProvider(id: string): ShippingProviderPlugin | undefined {
    return this.shippingProviders.get(id);
  }

  getTaxProvider(id: string): TaxProviderPlugin | undefined {
    return this.taxProviders.get(id);
  }

  getAllPaymentGateways(): PaymentGatewayPlugin[] {
    return Array.from(this.paymentGateways.values());
  }

  getAllShippingProviders(): ShippingProviderPlugin[] {
    return Array.from(this.shippingProviders.values());
  }

  getAllTaxProviders(): TaxProviderPlugin[] {
    return Array.from(this.taxProviders.values());
  }
}
