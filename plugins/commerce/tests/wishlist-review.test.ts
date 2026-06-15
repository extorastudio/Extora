import { describe, it, expect } from "vitest";

interface WishlistItem { productId: string; name: string; addedAt: string; }
interface Review { id: string; productId: string; rating: number; title: string; body: string; userId: string; createdAt: string; }

describe("Commerce Wishlist", () => {
  const wishlist: WishlistItem[] = [];

  function addToWishlist(productId: string, name: string): void {
    if (!wishlist.find(w => w.productId === productId)) {
      wishlist.push({ productId, name, addedAt: new Date().toISOString() });
    }
  }

  function removeFromWishlist(productId: string): void {
    const idx = wishlist.findIndex(w => w.productId === productId);
    if (idx !== -1) wishlist.splice(idx, 1);
  }

  it("should add items to wishlist", () => {
    addToWishlist("p1", "Widget");
    expect(wishlist.length).toBe(1);
    expect(wishlist[0]!.name).toBe("Widget");
  });

  it("should not add duplicates", () => {
    addToWishlist("p2", "Gizmo");
    addToWishlist("p2", "Gizmo");
    expect(wishlist.length).toBe(2);
  });

  it("should remove items", () => {
    removeFromWishlist("p1");
    expect(wishlist.length).toBe(1);
  });
});

describe("Commerce Reviews", () => {
  const reviews: Review[] = [];

  function addReview(data: Omit<Review, "id" | "createdAt">): Review {
    const review: Review = { id: `r_${reviews.length+1}`, ...data, createdAt: new Date().toISOString() };
    reviews.push(review);
    return review;
  }

  function getAvgRating(productId: string): number {
    const productReviews = reviews.filter(r => r.productId === productId);
    if (productReviews.length === 0) return 0;
    return productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
  }

  it("should add product reviews", () => {
    const r = addReview({ productId: "p1", rating: 5, title: "Great!", body: "Love it", userId: "u1" });
    expect(r.rating).toBe(5);
    expect(reviews.length).toBe(1);
  });

  it("should calculate average rating", () => {
    addReview({ productId: "p1", rating: 4, title: "Good", body: "Nice", userId: "u2" });
    addReview({ productId: "p1", rating: 5, title: "Amazing", body: "Wow", userId: "u3" });
    const avg = getAvgRating("p1");
    expect(avg).toBeCloseTo(4.67, 1);
  });

  it("should return 0 for unreviewed product", () => {
    expect(getAvgRating("unknown")).toBe(0);
  });
});
