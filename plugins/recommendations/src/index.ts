/**
 * Extora Recommendation Engine Plugin
 * Amazon-style recommendations + search suggestions
 *
 * Features:
 * - Frequently Bought Together (FBT)
 * - Customers Also Bought (collaborative filtering)
 * - Trending Products
 * - Personalized recommendations
 * - Search autocomplete + suggestions
 * - Related searches
 */

interface Product {
  id: string; name: string; category: string; price: number;
  tags: string[]; rating: number; reviews: number;
  slug: string; images: string[]; dealType?: string;
  upSellIds?: string[]; crossSellIds?: string[];
}

interface ViewEvent {
  productId: string; timestamp: number;
}

interface SearchEvent {
  query: string; timestamp: number;
}

// In-memory tracking (production would use DB)
const viewHistory: ViewEvent[] = [];
const searchHistory: SearchEvent[] = [];
const productViews: Record<string, number> = {};
const productBuys: Record<string, number> = {};
const categoryPairs: Record<string, Record<string, number>> = {};

export function recordProductView(productId: string) {
  viewHistory.push({ productId, timestamp: Date.now() });
  productViews[productId] = (productViews[productId] ?? 0) + 1;

  if (viewHistory.length > 1000) viewHistory.splice(0, 500);
}

export function recordProductBuy(productId: string, category: string) {
  productBuys[productId] = (productBuys[productId] ?? 0) + 1;
}

export function recordSearch(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return;
  searchHistory.push({ query: q, timestamp: Date.now() });
  if (searchHistory.length > 500) searchHistory.splice(0, 200);
}

/**
 * Frequently Bought Together — products often bought with this one
 */
export function getFrequentlyBoughtTogether(
  productId: string,
  allProducts: Product[],
  limit = 4,
): Product[] {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return [];

  const related: Product[] = [];

  // Up-sell products
  if (product.upSellIds?.length) {
    for (const id of product.upSellIds) {
      const p = allProducts.find((x) => x.id === id);
      if (p) related.push(p);
    }
  }

  // Same category products
  for (const p of allProducts) {
    if (p.id !== productId && p.category === product.category) {
      related.push(p);
    }
  }

  // Most viewed in same category
  const sorted = [...related].sort((a, b) => (productViews[b.id] ?? 0) - (productViews[a.id] ?? 0));

  return sorted.slice(0, limit);
}

/**
 * Customers Also Bought — collaborative-style recommendations
 */
export function getAlsoBought(
  productId: string,
  allProducts: Product[],
  limit = 6,
): Product[] {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return [];

  const candidates = allProducts
    .filter((p) => p.id !== productId && p.category === product.category)
    .sort((a, b) => {
      const scoreA = (productBuys[a.id] ?? 0) + (productViews[a.id] ?? 0) * 0.5;
      const scoreB = (productBuys[b.id] ?? 0) + (productViews[b.id] ?? 0) * 0.5;
      return scoreB - scoreA;
    });

  return candidates.slice(0, limit);
}

/**
 * Trending Products — most viewed recently
 */
export function getTrendingProducts(allProducts: Product[], limit = 8): Product[] {
  return allProducts
    .filter((p) => (productViews[p.id] ?? 0) > 0 || p.rating >= 4)
    .sort((a, b) => {
      const scoreA = (productViews[a.id] ?? 0) * 2 + a.rating * 10 + a.reviews;
      const scoreB = (productViews[b.id] ?? 0) * 2 + b.rating * 10 + b.reviews;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/**
 * Search autocomplete — suggest matching product names
 */
export function searchSuggest(
  query: string,
  allProducts: Product[],
  limit = 5,
): string[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const matches = allProducts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q),
    )
    .slice(0, limit)
    .map((p) => p.name);

  return matches;
}

/**
 * Related searches — based on search history
 */
export function getRelatedSearches(
  query: string,
  _allProducts: Product[],
  limit = 4,
): string[] {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const related: Record<string, number> = {};

  for (const event of searchHistory) {
    const eventWords = event.query.split(/\s+/);
    for (const w of eventWords) {
      if (words.some((qw) => eventWords.includes(qw)) && event.query !== q) {
        related[event.query] = (related[event.query] ?? 0) + 1;
      }
    }
  }

  return Object.entries(related)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([k]) => k);
}

/**
 * Personalized recommendations — based on view history
 */
export function getPersonalized(
  allProducts: Product[],
  limit = 6,
): Product[] {
  const viewedCategories = new Map<string, number>();
  const viewedIds = new Set<string>();

  for (const event of viewHistory) {
    viewedIds.add(event.productId);
    const p = allProducts.find((x) => x.id === event.productId);
    if (p) {
      viewedCategories.set(p.category, (viewedCategories.get(p.category) ?? 0) + 1);
    }
  }

  const topCategory = [...viewedCategories.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k)[0];

  return allProducts
    .filter((p) => !viewedIds.has(p.id) && p.category === topCategory)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
