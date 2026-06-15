import { BasePlugin } from "@extora/sdk";
import type { PluginManifest } from "@extora/types";

const manifest: PluginManifest = {
  name: "@extora/commerce",
  version: "0.0.0",
  type: "plugin",
  title: "Extora Commerce",
  description: "Full ecommerce plugin — products, cart, checkout, orders, payments, shipping, tax, coupons",
  author: { name: "Extora Team", email: "team@extora.dev" },
  license: "UNLICENSED",
  extora: { core: ">=1.0.0 <2.0.0" },
  dependencies: { "@extora/auth": ">=1.0.0" },
  permissions: [
    "database:read", "database:write", "database:schema",
    "storage:read", "storage:write",
    "http:outbound:*", "user:read",
  ],
  entry: { server: "dist/index.js", studio: "dist/studio/index.js" },
  hooks: {
    actions: ["order.created", "order.completed", "payment.received", "shipment.created"],
    filters: ["cart.total", "checkout.validate", "order.before_create", "product.price"],
    events: ["order.placed", "payment.authorized", "shipment.shipped", "inventory.updated"],
  },
  api: { rest: { endpoints: ["/api/v1/commerce/*"] } },
  database: { migrations: "dist/migrations/" },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- public API type definitions
interface CommerceProduct {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  type: "simple" | "variable" | "virtual" | "downloadable";
  categoryId?: string;
  variants: CommerceVariant[];
}

interface CommerceVariant {
  id: string;
  productId: string;
  sku: string;
  price: number;
  currency: string;
  attributes: Record<string, string>;
  isDefault: boolean;
  inventory: CommerceInventory;
}

interface CommerceInventory {
  variantId: string;
  quantity: number;
  reservedQty: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
}

interface CartItem {
  variantId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  attributes: Record<string, string>;
}

interface CommerceCart {
  id: string;
  userId?: string;
  sessionId?: string;
  currency: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  couponCode?: string;
}

interface CommerceOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  currency: string;
  shippingAddress?: Address;
  billingAddress?: Address;
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export default class CommercePlugin extends BasePlugin {
  override manifest = manifest;

  override async onInstall(): Promise<void> {
    const db = this.db.getPluginDb("commerce");

    await db.createTable("plugin_commerce_products", {
      id: "TEXT PRIMARY KEY",
      name: "TEXT NOT NULL",
      slug: "TEXT NOT NULL UNIQUE",
      description: "TEXT",
      status: "TEXT DEFAULT 'draft'",
      type: "TEXT DEFAULT 'simple'",
      category_id: "TEXT",
      images: "JSONB DEFAULT '[]'",
      featured: "BOOLEAN DEFAULT false",
      created_at: "TIMESTAMP DEFAULT NOW()",
      updated_at: "TIMESTAMP DEFAULT NOW()",
    });

    await db.createTable("plugin_commerce_variants", {
      id: "TEXT PRIMARY KEY",
      product_id: "TEXT NOT NULL",
      sku: "TEXT NOT NULL UNIQUE",
      barcode: "TEXT",
      price: "FLOAT NOT NULL",
      compare_at_price: "FLOAT",
      cost_price: "FLOAT",
      currency: "TEXT DEFAULT 'USD'",
      attributes: "JSONB DEFAULT '{}'",
      weight: "FLOAT",
      weight_unit: "TEXT DEFAULT 'kg'",
      is_default: "BOOLEAN DEFAULT false",
      is_active: "BOOLEAN DEFAULT true",
    });

    await db.createTable("plugin_commerce_inventory", {
      id: "TEXT PRIMARY KEY",
      variant_id: "TEXT NOT NULL UNIQUE",
      quantity: "INTEGER DEFAULT 0",
      reserved_qty: "INTEGER DEFAULT 0",
      low_stock_threshold: "INTEGER DEFAULT 5",
      allow_backorder: "BOOLEAN DEFAULT false",
    });

    await db.createTable("plugin_commerce_categories", {
      id: "TEXT PRIMARY KEY",
      name: "TEXT NOT NULL",
      slug: "TEXT NOT NULL UNIQUE",
      parent_id: "TEXT",
      sort_order: "INTEGER DEFAULT 0",
    });

    await db.createTable("plugin_commerce_carts", {
      id: "TEXT PRIMARY KEY",
      user_id: "TEXT",
      session_id: "TEXT",
      currency: "TEXT DEFAULT 'USD'",
      discount_total: "FLOAT DEFAULT 0",
      coupon_code: "TEXT",
      created_at: "TIMESTAMP DEFAULT NOW()",
      updated_at: "TIMESTAMP DEFAULT NOW()",
    });

    await db.createTable("plugin_commerce_cart_items", {
      id: "TEXT PRIMARY KEY",
      cart_id: "TEXT NOT NULL",
      variant_id: "TEXT NOT NULL",
      quantity: "INTEGER NOT NULL DEFAULT 1",
      unit_price: "FLOAT NOT NULL",
      total_price: "FLOAT NOT NULL",
    });

    await db.createTable("plugin_commerce_orders", {
      id: "TEXT PRIMARY KEY",
      order_number: "TEXT NOT NULL UNIQUE",
      user_id: "TEXT",
      customer_email: "TEXT NOT NULL",
      customer_name: "TEXT",
      status: "TEXT DEFAULT 'pending'",
      subtotal: "FLOAT NOT NULL DEFAULT 0",
      discount_total: "FLOAT DEFAULT 0",
      tax_total: "FLOAT DEFAULT 0",
      shipping_total: "FLOAT DEFAULT 0",
      grand_total: "FLOAT NOT NULL DEFAULT 0",
      currency: "TEXT DEFAULT 'USD'",
      shipping_address: "JSONB",
      billing_address: "JSONB",
      notes: "TEXT",
      placed_at: "TIMESTAMP",
      created_at: "TIMESTAMP DEFAULT NOW()",
      updated_at: "TIMESTAMP DEFAULT NOW()",
    });

    await db.createTable("plugin_commerce_order_items", {
      id: "TEXT PRIMARY KEY",
      order_id: "TEXT NOT NULL",
      variant_id: "TEXT NOT NULL",
      name: "TEXT NOT NULL",
      sku: "TEXT NOT NULL",
      quantity: "INTEGER NOT NULL",
      unit_price: "FLOAT NOT NULL",
      total_price: "FLOAT NOT NULL",
      attributes: "JSONB DEFAULT '{}'",
    });

    await db.createTable("plugin_commerce_payments", {
      id: "TEXT PRIMARY KEY",
      order_id: "TEXT NOT NULL",
      gateway: "TEXT NOT NULL",
      gateway_transaction_id: "TEXT",
      amount: "FLOAT NOT NULL",
      currency: "TEXT DEFAULT 'USD'",
      status: "TEXT DEFAULT 'pending'",
      method: "TEXT",
      refunded_amount: "FLOAT DEFAULT 0",
      created_at: "TIMESTAMP DEFAULT NOW()",
    });

    await db.createTable("plugin_commerce_shipments", {
      id: "TEXT PRIMARY KEY",
      order_id: "TEXT NOT NULL",
      provider: "TEXT NOT NULL",
      tracking_number: "TEXT",
      tracking_url: "TEXT",
      status: "TEXT DEFAULT 'pending'",
      items: "JSONB DEFAULT '[]'",
      shipped_at: "TIMESTAMP",
      delivered_at: "TIMESTAMP",
    });

    await db.createTable("plugin_commerce_coupons", {
      id: "TEXT PRIMARY KEY",
      code: "TEXT NOT NULL UNIQUE",
      type: "TEXT NOT NULL",
      value: "FLOAT NOT NULL",
      min_order_amount: "FLOAT",
      max_uses: "INTEGER",
      max_uses_per_user: "INTEGER",
      current_uses: "INTEGER DEFAULT 0",
      is_active: "BOOLEAN DEFAULT true",
      starts_at: "TIMESTAMP",
      expires_at: "TIMESTAMP",
      applies_to: "JSONB",
    });

    await db.createTable("plugin_commerce_tax_rules", {
      id: "TEXT PRIMARY KEY",
      name: "TEXT NOT NULL",
      country_code: "TEXT NOT NULL",
      state_code: "TEXT",
      zip_code: "TEXT",
      rate: "FLOAT NOT NULL",
      is_active: "BOOLEAN DEFAULT true",
      priority: "INTEGER DEFAULT 0",
    });

    this.logger.info("Commerce plugin installed — 12 tables created");
  }

  override async onActivate(): Promise<void> {
    this.addFilter("cart.total", async (cart: unknown) => {
      const c = cart as CommerceCart;
      const subtotal = c.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const grandTotal = subtotal - c.discountTotal + c.taxTotal + c.shippingTotal;
      return { ...c, subtotal, grandTotal };
    });

    this.addFilter("checkout.validate", async (order: unknown) => {
      const o = order as CommerceOrder;
      const errors: string[] = [];

      if (!o.customerEmail) errors.push("Customer email is required");
      if (!o.shippingAddress) errors.push("Shipping address is required");
      if (!o.items || o.items.length === 0) errors.push("Cart is empty");

      return { ...o, valid: errors.length === 0, errors };
    });

    this.addFilter("order.before_create", async (order: unknown) => {
      const o = order as CommerceOrder;
      const orderNumber = generateOrderNumber();
      return { ...o, orderNumber, status: "confirmed" as const };
    });

    this.addAction("order.created", async (order: unknown) => {
      const o = order as CommerceOrder;
      await this.publishEvent("order.placed", {
        orderId: o.id,
        orderNumber: o.orderNumber,
        total: o.grandTotal,
        currency: o.currency,
        customerEmail: o.customerEmail,
      });
      this.logger.info(`Order placed: ${o.orderNumber}`);
    });

    this.addAction("payment.received", async (payment: unknown) => {
      const p = payment as { orderId: string; amount: number; gateway: string };
      await this.publishEvent("payment.authorized", p);
    });

    this.addAction("shipment.created", async (shipment: unknown) => {
      const s = shipment as { orderId: string; trackingNumber: string };
      await this.publishEvent("shipment.shipped", s);
    });

    this.logger.info("Commerce plugin activated");
  }

  override async onDeactivate(): Promise<void> {
    this.logger.info("Commerce plugin deactivated");
  }
}

let orderCounter = 1000;
function generateOrderNumber(): string {
  orderCounter++;
  return `EXT-${String(orderCounter)}`;
}
