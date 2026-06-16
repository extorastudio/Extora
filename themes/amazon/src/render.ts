export interface ThemeData {
  siteName: string;
  pages: PageData[];
  products: ProductData[];
  categories: CategoryData[];
  settings: Record<string, unknown>;
}

export interface PageData {
  slug: string;
  title: string;
  content: string;
  description: string;
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  description: string;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  sku: string;
  tags: string[];
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  productCount: number;
}

function escapeHtml(str: string): string {
  return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function starRating(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

function formatPrice(price: number, currency: string): string {
  const symbol = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${symbol}${price.toFixed(2)}`;
}

function renderLayout(data: ThemeData, bodyHtml: string, activePage: string): string {
  const year = new Date().getFullYear();
  const currency = (data.settings.currency as string) ?? "USD";
  const cartCount = (data.settings.cartCount as number) ?? 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(data.siteName)} — ${activePage}</title>
<meta name="generator" content="Extora — Amazon Theme">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f1111;background:#eaeded;line-height:1.5}
.container{max-width:1500px;margin:0 auto;padding:0 15px}
/* TOP NAV */
.top-nav{background:#131921;color:white;padding:10px 0}
.top-nav .container{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.top-nav .logo{font-size:1.4rem;font-weight:700;color:#febd69;text-decoration:none;white-space:nowrap}
.top-nav .logo span{color:white;font-weight:400}
.top-nav .search{flex:1;min-width:200px;display:flex}
.top-nav .search input{flex:1;padding:8px 12px;border:none;border-radius:4px 0 0 4px;font-size:0.95rem}
.top-nav .search button{background:#febd69;border:none;padding:8px 16px;border-radius:0 4px 4px 0;cursor:pointer;font-size:0.95rem;font-weight:600}
.top-nav .nav-links{display:flex;gap:16px;align-items:center}
.top-nav .nav-links a{color:white;text-decoration:none;font-size:0.9rem;white-space:nowrap}
.top-nav .cart-link{display:flex;align-items:center;gap:4px;font-weight:600}
/* SUB NAV */
.sub-nav{background:#232f3e;color:white;padding:8px 0}
.sub-nav .container{display:flex;gap:16px;flex-wrap:wrap;overflow-x:auto}
.sub-nav a{color:white;text-decoration:none;font-size:0.85rem;white-space:nowrap;padding:4px 8px;border-radius:2px}
.sub-nav a:hover{outline:1px solid white}
/* MAIN CONTENT */
main{min-height:70vh}
/* HERO BANNER */
.hero-banner{background:linear-gradient(135deg,#232f3e 0%,#131921 50%,#eaeded 100%);padding:40px 0 60px;text-align:center;color:white}
.hero-banner h1{font-size:2.5rem;margin-bottom:8px}
.hero-banner p{font-size:1.1rem;opacity:0.9;max-width:600px;margin:0 auto}
/* PRODUCT GRID */
.products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;padding:20px 0}
.product-card{background:white;border-radius:4px;padding:16px;transition:box-shadow 0.2s;display:flex;flex-direction:column}
.product-card:hover{box-shadow:0 2px 12px rgba(0,0,0,0.12)}
.product-card .product-img{width:100%;height:200px;object-fit:contain;background:#f7f7f7;border-radius:2px;margin-bottom:12px}
.product-card .product-name{font-size:0.95rem;color:#0f1111;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.product-card .product-rating{color:#febd69;font-size:0.85rem;margin-bottom:4px}
.product-card .product-reviews{color:#565959;font-size:0.8rem}
.product-card .price-row{display:flex;align-items:baseline;gap:8px;margin:8px 0}
.product-card .price{font-size:1.3rem;font-weight:600;color:#b12704}
.product-card .compare-price{font-size:0.85rem;color:#565959;text-decoration:line-through}
.product-card .badge{display:inline-block;background:#cc0c39;color:white;font-size:0.75rem;padding:2px 6px;border-radius:2px;margin-bottom:8px}
.product-card .btn-add{display:block;width:100%;padding:8px;text-align:center;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-size:0.85rem;font-weight:500;cursor:pointer;margin-top:auto}
.product-card .btn-add:hover{background:#f7ca00}
/* CATEGORY CARDS */
.categories-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:20px 0}
.category-card{background:white;border-radius:4px;padding:16px;text-decoration:none;color:#0f1111;transition:box-shadow 0.2s}
.category-card:hover{box-shadow:0 2px 12px rgba(0,0,0,0.12)}
.category-card h3{font-size:1rem;margin-bottom:4px}
.category-card p{font-size:0.85rem;color:#565959}
/* PRODUCT DETAIL */
.product-detail{max-width:1200px;margin:20px auto;background:white;border-radius:4px;padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:32px}
.product-detail .product-gallery{display:flex;flex-direction:column;gap:12px}
.product-detail .product-gallery img{width:100%;max-height:400px;object-fit:contain;background:#f7f7f7;border-radius:4px}
.product-detail .product-info h1{font-size:1.5rem;margin-bottom:8px}
.product-detail .product-info .rating{color:#febd69;margin-bottom:8px}
.product-detail .product-info .price{font-size:1.8rem;color:#b12704;font-weight:600;margin:12px 0}
.product-detail .product-info .description{color:#0f1111;margin-bottom:16px;line-height:1.6}
.product-detail .btn-cart{padding:12px 32px;background:#ffd814;border:1px solid #fcd200;border-radius:20px;font-size:1rem;cursor:pointer;display:inline-block}
.product-detail .btn-cart:hover{background:#f7ca00}
.product-detail .sku{color:#565959;font-size:0.85rem;margin-top:12px}
/* CART TABLE */
.cart-table{width:100%;background:white;border-radius:4px;overflow:hidden;margin:20px 0}
.cart-table th{background:#f0f2f2;text-align:left;padding:12px;font-size:0.85rem;color:#565959}
.cart-table td{padding:12px;border-bottom:1px solid #eaeded}
.cart-table .total-row{font-size:1.2rem;font-weight:700}
.cart-table .total-row td{padding-top:16px}
.btn-primary{padding:10px 24px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-size:0.95rem;font-weight:500;cursor:pointer;text-decoration:none;color:#0f1111}
.btn-primary:hover{background:#f7ca00}
.btn-outline{padding:10px 24px;background:white;border:1px solid #d5d9d9;border-radius:8px;font-size:0.95rem;cursor:pointer;color:#0f1111}
.btn-outline:hover{background:#f7fafa}
/* SECTION HEADERS */
.section-header{display:flex;align-items:baseline;gap:12px;padding:20px 15px 8px}
.section-header h2{font-size:1.3rem;color:#0f1111}
.section-header a{font-size:0.85rem;color:#007185;text-decoration:none}
.section-header a:hover{color:#c7511f;text-decoration:underline}
/* FOOTER */
footer{background:#232f3e;color:white;padding:40px 0 20px;margin-top:40px}
footer .footer-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;margin-bottom:24px}
footer h4{font-size:1rem;margin-bottom:8px}
footer a{display:block;color:#ddd;text-decoration:none;font-size:0.85rem;padding:2px 0}
footer a:hover{text-decoration:underline}
footer .copyright{text-align:center;color:#999;font-size:0.8rem;padding-top:16px;border-top:1px solid #3a4553}
/* PAGE CONTENT */
.page-content{max-width:900px;margin:20px auto;background:white;border-radius:4px;padding:32px}
.page-content h1{font-size:1.8rem;margin-bottom:16px}
.page-content p{color:#0f1111;line-height:1.7;margin-bottom:12px}
/* EMPTY STATES */
.empty-state{text-align:center;padding:60px 20px}
.empty-state h3{font-size:1.3rem;color:#0f1111;margin-bottom:8px}
.empty-state p{color:#565959}
/* CHECKOUT */
.checkout-form{max-width:600px;margin:20px auto;background:white;border-radius:4px;padding:32px}
.checkout-form h2{font-size:1.3rem;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #eaeded}
.checkout-form label{display:block;font-size:0.9rem;font-weight:600;margin:12px 0 4px}
.checkout-form input,.checkout-form select{width:100%;padding:8px 12px;border:1px solid #888c8c;border-radius:4px;font-size:0.95rem}
.checkout-form .order-summary{background:#f0f2f2;border-radius:4px;padding:16px;margin:16px 0}
.checkout-form .order-summary .row{display:flex;justify-content:space-between;padding:4px 0;font-size:0.9rem}
.checkout-form .order-summary .total{font-weight:700;font-size:1.1rem;border-top:1px solid #d5d9d9;padding-top:8px;margin-top:4px}
/* RESPONSIVE */
@media(max-width:768px){
.product-detail{grid-template-columns:1fr}
.products-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.top-nav .search{order:3;width:100%}
}
@media(max-width:480px){
.products-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
}
</style>
</head>
<body>
<header>
<div class="top-nav">
<div class="container">
<a href="/index.html" class="logo">extora<span>.shop</span></a>
<form class="search" action="/search.html" method="get">
<input type="text" name="q" placeholder="Search products...">
<button type="submit">Go</button>
</form>
<div class="nav-links">
<a href="/account.html">Hello, Sign in</a>
<a href="/orders.html">Orders</a>
<a href="/cart.html" class="cart-link">Cart (${String(cartCount)})</a>
</div>
</div>
</div>
<nav class="sub-nav">
<div class="container">
<a href="/index.html">All</a>
<a href="/categories.html">Categories</a>
${data.categories.slice(0, 6).map((c) => `<a href="/category-${c.slug}.html">${escapeHtml(c.name)}</a>`).join("\n")}
<a href="/deals.html">Today's Deals</a>
</div>
</nav>
</header>
<main>${bodyHtml}</main>
<footer>
<div class="container">
<div class="footer-grid">
<div>
<h4>Get to Know Us</h4>
<a href="/about.html">About Extora</a>
<a href="/blog.html">Blog</a>
<a href="/careers.html">Careers</a>
</div>
<div>
<h4>Make Money with Us</h4>
<a href="/sell.html">Sell products</a>
<a href="/affiliate.html">Affiliate Program</a>
<a href="/advertise.html">Advertise</a>
</div>
<div>
<h4>Payment Products</h4>
<a href="/cards.html">Gift Cards</a>
<a href="/reload.html">Reload Balance</a>
</div>
<div>
<h4>Let Us Help You</h4>
<a href="/account.html">Your Account</a>
<a href="/orders.html">Your Orders</a>
<a href="/returns.html">Returns</a>
<a href="/help.html">Help</a>
</div>
</div>
<div class="copyright">&copy; ${String(year)} ${escapeHtml(data.siteName)}. Published with Extora.</div>
</div>
</footer>
</body>
</html>`;
}

export function renderHome(data: ThemeData): string {
  const sections: string[] = [];

  if (data.categories.length > 0) {
    sections.push(`
<section class="section-header"><h2>Shop by Category</h2></section>
<div class="container"><div class="categories-grid">
${data.categories.map((c) => `<a href="/category-${c.slug}.html" class="category-card"><h3>${escapeHtml(c.name)}</h3><p>${c.productCount} products</p></a>`).join("\n")}
</div></div>`);
  }

  if (data.products.length > 0) {
    sections.push(`
<section class="section-header"><h2>Featured Products</h2><a href="/products.html">See all</a></section>
<div class="container"><div class="products-grid">
${data.products.slice(0, 12).map((p) => renderProductCard(p, (data.settings.currency as string) ?? "USD")).join("\n")}
</div></div>`);
  }

  if (sections.length === 0) {
    sections.push(`
<div class="hero-banner">
<h1>Welcome to ${escapeHtml(data.siteName)}</h1>
<p>Discover amazing products at great prices. Start shopping now!</p>
</div>
<div class="empty-state">
<h3>No products yet</h3>
<p>Add products in the Extora Studio admin panel to get started.</p>
</div>`);
  }

  return renderLayout(data, sections.join("\n"), "Home");
}

export function renderCategory(data: ThemeData, categorySlug: string): string {
  const category = data.categories.find((c) => c.slug === categorySlug);
  if (!category) {
    return renderLayout(data, `<div class="empty-state"><h3>Category not found</h3></div>`, "Category");
  }

  const catProducts = data.products.filter((p) => p.category === category.name);

  return renderLayout(data, `
<div class="container" style="padding-top:20px">
<h1 style="font-size:1.5rem;margin-bottom:16px">${escapeHtml(category.name)}</h1>
${category.description ? `<p style="color:#565959;margin-bottom:16px">${escapeHtml(category.description)}</p>` : ""}
<div class="products-grid">
${catProducts.length > 0 ? catProducts.map((p) => renderProductCard(p, (data.settings.currency as string) ?? "USD")).join("\n") : `<div class="empty-state"><h3>No products in this category</h3></div>`}
</div>
</div>`, category.name);
}

export function renderProduct(data: ThemeData, productId: string): string {
  const product = data.products.find((p) => p.id === productId);
  if (!product) {
    return renderLayout(data, `<div class="empty-state"><h3>Product not found</h3></div>`, "Product");
  }

  const currency = (data.settings.currency as string) ?? "USD";

  return renderLayout(data, `
<div class="container"><div class="product-detail">
<div class="product-gallery">
${product.images.length > 0 ? product.images.map((img) => `<img src="${escapeHtml(img)}" alt="${escapeHtml(product.name)}" loading="lazy">`).join("\n") : `<div style="width:100%;height:400px;background:#f7f7f7;display:flex;align-items:center;justify-content:center;color:#999;font-size:1.2rem">No Image</div>`}
</div>
<div class="product-info">
<h1>${escapeHtml(product.name)}</h1>
<div class="rating">${starRating(product.rating)} <span style="color:#007185">${product.reviews} ratings</span></div>
<div class="price">${formatPrice(product.price, currency)}</div>
${product.comparePrice ? `<p style="text-decoration:line-through;color:#565959">${formatPrice(product.comparePrice, currency)}</p>` : ""}
${!product.inStock ? `<p class="badge" style="margin:8px 0">Currently unavailable</p>` : ""}
<div class="description">${product.description}</div>
${product.inStock ? `<button class="btn-cart">Add to Cart</button>` : ""}
<div class="sku">SKU: ${escapeHtml(product.sku)}</div>
</div>
</div></div>`, product.name);
}

export function renderCart(data: ThemeData): string {
  const currency = (data.settings.currency as string) ?? "USD";
  const cartItems = data.products.slice(0, 2);
  const subtotal = cartItems.reduce((sum, p) => sum + p.price, 0);
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return renderLayout(data, `
<div class="container">
<h1 style="font-size:1.5rem;margin:20px 0">Shopping Cart</h1>
${cartItems.length === 0 ? `<div class="empty-state"><h3>Your cart is empty</h3><p>Start adding products!</p></div>` : `
<div class="cart-container" style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start">
<div>
<table class="cart-table">
<thead><tr><th>Product</th><th>Price</th><th>Qty</th></tr></thead>
<tbody>
${cartItems.map((p) => `<tr><td><a href="/product-${p.id}.html" style="color:#007185;text-decoration:none">${escapeHtml(p.name)}</a></td><td>${formatPrice(p.price, currency)}</td><td>1</td></tr>`).join("\n")}
<tr class="total-row"><td colspan="2">Subtotal</td><td>${formatPrice(subtotal, currency)}</td></tr>
</tbody>
</table>
</div>
<div style="background:white;border-radius:4px;padding:20px">
<p style="font-size:0.85rem;color:#565959">Subtotal (${cartItems.length} items): <strong>${formatPrice(subtotal, currency)}</strong></p>
<a href="/checkout.html" class="btn-primary" style="display:block;text-align:center;margin-top:12px">Proceed to Checkout</a>
</div>
</div>`}
</div>`, "Cart");
}

export function renderCheckout(data: ThemeData): string {
  const currency = (data.settings.currency as string) ?? "USD";
  const subtotal = 99.99;
  const tax = 10.00;
  const shipping = 5.99;
  const total = subtotal + tax + shipping;

  return renderLayout(data, `
<div class="container"><div class="checkout-form">
<h2>Checkout</h2>
<label>Full Name</label><input type="text" placeholder="John Doe" required>
<label>Email</label><input type="email" placeholder="john@example.com" required>
<label>Address</label><input type="text" placeholder="123 Main St" required>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
<div><label>City</label><input type="text" placeholder="City"></div>
<div><label>ZIP Code</label><input type="text" placeholder="12345"></div>
</div>
<label>Payment Method</label>
<select><option>Credit Card</option><option>Debit Card</option><option>UPI</option><option>Net Banking</option></select>
<label>Card Number</label><input type="text" placeholder="1234 5678 9012 3456">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
<div><label>Expiry</label><input type="text" placeholder="MM/YY"></div>
<div><label>CVV</label><input type="text" placeholder="123"></div>
</div>
<div class="order-summary">
<h3 style="font-size:1rem;margin-bottom:8px">Order Summary</h3>
<div class="row"><span>Subtotal</span><span>${formatPrice(subtotal, currency)}</span></div>
<div class="row"><span>Tax</span><span>${formatPrice(tax, currency)}</span></div>
<div class="row"><span>Shipping</span><span>${formatPrice(shipping, currency)}</span></div>
<div class="row total"><span>Total</span><span>${formatPrice(total, currency)}</span></div>
</div>
<button class="btn-primary" style="width:100%;padding:14px;font-size:1.1rem;margin-top:16px">Place Order</button>
</div></div>`, "Checkout");
}

export function renderPage(data: ThemeData, page: PageData): string {
  return renderLayout(data, `
<div class="page-content">
<h1>${escapeHtml(page.title)}</h1>
${page.content}
</div>`, page.title);
}

function renderProductCard(product: ProductData, currency: string): string {
  const savings = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  return `<div class="product-card">
${product.images.length > 0 ? `<img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" class="product-img" loading="lazy">` : `<div class="product-img" style="display:flex;align-items:center;justify-content:center;color:#999">No Image</div>`}
<a href="/product-${product.id}.html" style="text-decoration:none;color:inherit">
<span class="product-name">${escapeHtml(product.name)}</span>
</a>
<span class="product-rating">${starRating(product.rating)}</span>
<span class="product-reviews">${product.reviews}</span>
<div class="price-row">
<span class="price">${formatPrice(product.price, currency)}</span>
${product.comparePrice ? `<span class="compare-price">${formatPrice(product.comparePrice, currency)}</span>` : ""}
</div>
${savings > 0 ? `<span class="badge">-${savings}%</span>` : ""}
${product.inStock ? `<button class="btn-add">Add to Cart</button>` : `<p style="color:#cc0c39;font-size:0.85rem;margin-top:auto">Out of Stock</p>`}
</div>`;
}
