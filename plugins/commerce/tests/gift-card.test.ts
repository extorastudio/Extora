import { describe, it, expect } from "vitest";

interface GiftCard { code: string; balance: number; isActive: boolean; expiresAt?: string; }

function createGiftCard(initialBalance: number): GiftCard {
  return { code: `GC-${Math.random().toString(36).slice(2,8).toUpperCase()}`, balance: initialBalance, isActive: true };
}

function redeem(card: GiftCard, amount: number): { success: boolean; remaining: number; error?: string } {
  if (!card.isActive) return { success: false, remaining: card.balance, error: "Card is not active" };
  if (card.expiresAt && new Date(card.expiresAt) < new Date()) return { success: false, remaining: card.balance, error: "Card expired" };
  if (amount > card.balance) return { success: false, remaining: card.balance, error: "Insufficient balance" };
  card.balance -= amount;
  return { success: true, remaining: card.balance };
}

describe("Commerce Gift Cards", () => {
  it("should create gift card with balance", () => {
    const card = createGiftCard(100);
    expect(card.balance).toBe(100);
    expect(card.code).toMatch(/^GC-/);
    expect(card.isActive).toBe(true);
  });

  it("should redeem valid amount", () => {
    const card = createGiftCard(50);
    const result = redeem(card, 30);
    expect(result.success).toBe(true);
    expect(card.balance).toBe(20);
  });

  it("should reject insufficient balance", () => {
    const card = createGiftCard(25);
    const result = redeem(card, 30);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Insufficient");
  });

  it("should reject expired card", () => {
    const card: GiftCard = { code: "GC-EXPIRED", balance: 50, isActive: true, expiresAt: "2024-01-01" };
    const result = redeem(card, 10);
    expect(result.success).toBe(false);
    expect(result.error).toContain("expired");
  });

  it("should reject inactive card", () => {
    const card: GiftCard = { code: "GC-DEAD", balance: 50, isActive: false };
    const result = redeem(card, 10);
    expect(result.success).toBe(false);
  });

  it("should allow full balance redemption", () => {
    const card = createGiftCard(100);
    const result = redeem(card, 100);
    expect(result.success).toBe(true);
    expect(card.balance).toBe(0);
  });
});
