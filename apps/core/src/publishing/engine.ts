/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import type { Logger } from "@extora/types";

interface PublishedSite { id: string; url: string; pages: number; sizeKB: number; publishedAt: string; }
interface PageData { slug: string; title: string; description: string; content: string; }

const e = (s: any) => String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const stars = (n: number) => "★".repeat(Math.floor(n)) + "☆".repeat(5 - Math.floor(n));
const rupee = (n: number) => "₹" + n.toLocaleString("en-IN");

function layout(site: { name: string }, body: string, pageTitle: string, allProducts?: any[]): string {
  const productJson = allProducts ? JSON.stringify(allProducts) : "[]";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${e(pageTitle)} — ${e(site.name)}</title><meta name="generator" content="Extora"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;color:#0f1111;background:#eaeded;line-height:1.5}
.top-nav{background:#131921;color:white;font-size:14px}
.top-nav .inner{max-width:1500px;margin:0 auto;display:flex;align-items:center;gap:16px;padding:10px 15px}
.top-nav .logo{font-size:1.4rem;font-weight:700;color:#febd69;text-decoration:none}
.top-nav .search{flex:1;display:flex;height:40px}
.top-nav .search input{flex:1;padding:0 12px;border:none;border-radius:4px 0 0 4px;font-size:.95rem}
.top-nav .search button{background:#febd69;border:none;padding:0 16px;border-radius:0 4px 4px 0;font-weight:600;cursor:pointer}
.top-nav .nav-r{display:flex;gap:18px;align-items:center;white-space:nowrap}
.top-nav .nav-r a{color:white;text-decoration:none;font-size:.85rem}
.sub-nav{background:#232f3e}
.sub-nav .inner{max-width:1500px;margin:0 auto;display:flex;gap:4px;padding:6px 15px;overflow-x:auto}
.sub-nav a{color:white;text-decoration:none;font-size:.85rem;padding:4px 10px;border-radius:2px;white-space:nowrap}

.container{max-width:1500px;margin:0 auto;padding:0 15px}
.breadcrumb{padding:10px 15px;font-size:.8rem;color:#565959}
.breadcrumb a{color:#565959;text-decoration:none}
.breadcrumb a:hover{color:#c7511f}

.pdetail{margin:0 auto 20px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.pdetail .gallery{display:flex;flex-direction:column;gap:8px}
.pdetail .gallery .main-img{width:100%;aspect-ratio:1;object-fit:contain;background:white;border-radius:4px;border:1px solid #e7e7e7}
.pdetail .thumbs{display:flex;gap:6px}
.pdetail .thumbs img{width:50px;height:50px;object-fit:contain;border:1px solid #e7e7e7;border-radius:2px;cursor:pointer}
.pdetail .thumbs img:hover{border-color:#febd69;box-shadow:0 0 0 2px #febd69}
.pdetail h1{font-size:1.5rem;line-height:1.3;margin-bottom:8px}
.pdetail .rating-row{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:.85rem}
.pdetail .rating-row .stars{color:#febd69}
.pdetail .rating-row .revs{color:#007185;cursor:pointer}
.pdetail .divider{border:0;border-top:1px solid #e7e7e7;margin:12px 0}
.pdetail .mrp-row{font-size:1rem;color:#565959}
.pdetail .mrp-row .mrp{text-decoration:line-through}
.pdetail .price-row{display:flex;align-items:baseline;gap:8px;margin:4px 0}
.pdetail .price-row .price{font-size:1.8rem;color:#b12704}
.pdetail .discount{font-size:.9rem;color:#cc0c39;font-weight:600}
.pdetail .tax{font-size:.8rem;color:#565959}
.pdetail .emi{font-size:.85rem;color:#0f1111;margin:8px 0}
.pdetail .emi .price{font-size:1.1rem;color:#b12704;font-weight:600}
.pdetail .offers{background:#fff;border:1px solid #e7e7e7;border-radius:8px;padding:12px 16px;margin:12px 0}
.pdetail .offers h4{font-size:.9rem;color:#b12704;margin-bottom:6px}
.pdetail .offers li{font-size:.85rem;color:#0f1111;margin:4px 0 4px 16px}
.pdetail .features{margin:16px 0}
.pdetail .features h4{font-size:.95rem;margin-bottom:8px}
.pdetail .features ul{columns:2;column-gap:24px}
.pdetail .features li{font-size:.85rem;color:#0f1111;margin:4px 0 4px 16px;break-inside:avoid}
.pdetail .stock{font-size:1.1rem;color:#007600;font-weight:600;margin:8px 0}
.pdetail .delivery{font-size:.9rem;color:#0f1111;margin:4px 0}
.pdetail .delivery strong{color:#007600}
.pdetail .cod{font-size:.85rem;color:#565959}
.pdetail .qty-row{display:flex;align-items:center;gap:12px;margin:16px 0}
.pdetail .qty-row select{padding:4px 8px;border:1px solid #ddd;border-radius:8px;background:#f0f2f2;font-size:.9rem;cursor:pointer}
.pdetail .buttons{display:flex;flex-direction:column;gap:8px;margin:16px 0}
.pdetail .btn-cart{padding:12px 24px;background:#ffd814;border:1px solid #fcd200;border-radius:24px;font-size:1rem;cursor:pointer;text-align:center;font-weight:500}
.pdetail .btn-cart:hover{background:#f7ca00}
.pdetail .btn-buy{padding:12px 24px;background:#ffa41c;border:1px solid #ff8f00;border-radius:24px;font-size:1rem;cursor:pointer;text-align:center;font-weight:500}
.pdetail .btn-buy:hover{background:#fa8900}
.pdetail .secure{font-size:.8rem;color:#565959;margin-top:8px;display:flex;align-items:center;gap:6px}
.pdetail .seller-info{margin-top:16px;font-size:.85rem;color:#565959}
.pdetail .seller-info strong{color:#007185}
.pdetail .warranty{font-size:.85rem;color:#0f1111;margin:8px 0}
.pdetail .warranty strong{color:#565959}
.pdetail .return{font-size:.85rem;color:#007600}

.products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:0;background:white}
.product-card{background:white;border:1px solid #f0f0f0;transition:box-shadow .15s}
.product-card:hover{box-shadow:0 2px 12px rgba(0,0,0,.1)}
.product-card .img-wrap{height:200px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}
.product-card .img-wrap img{max-width:100%;max-height:100%;object-fit:contain}
.product-card .pname{font-size:.9rem;color:#0f1111;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.product-card a{text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%}
.product-card a:hover{color:inherit}
.product-card .stars{color:#febd69;font-size:.8rem}
.product-card .pr{display:flex;align-items:baseline;gap:6px;margin:6px 0}
.product-card .pr .p{font-size:1.1rem;font-weight:600;color:#b12704}
.product-card .pr .mrp{font-size:.8rem;color:#565959;text-decoration:line-through}
.product-card .badge{display:inline-block;background:#cc0c39;color:white;font-size:.7rem;padding:2px 6px;border-radius:2px;margin-bottom:4px}
.product-card .stock-ok{color:#007600;font-size:.75rem;margin-top:auto}

.search-suggestions{position:absolute;top:100%;left:0;right:0;background:white;border:1px solid #ddd;border-top:none;border-radius:0 0 4px 4px;box-shadow:0 4px 12px rgba(0,0,0,.12);z-index:1000;display:none;max-height:300px;overflow-y:auto}
.search-suggestions .sug-item{padding:10px 16px;cursor:pointer;font-size:.9rem;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:8px}
.search-suggestions .sug-item:hover{background:#f3f8ff}
.search-suggestions .sug-item .sug-name{flex:1;color:#0f1111}
.search-suggestions .sug-item .sug-cat{color:#565959;font-size:.8rem}
.search-suggestions .sug-item .sug-price{color:#b12704;font-weight:600;font-size:.85rem}
.search-suggestions .sug-highlight{font-weight:700;color:#c7511f}
.compare-check{position:absolute;top:6px;left:6px;z-index:2;font-size:1.1rem;color:#888;transition:color .2s;line-height:1}
.compare-check.checked{color:#ffd814}
.compare-bar{position:fixed;bottom:0;left:0;right:0;background:#232f3e;color:white;padding:12px 20px;display:none;z-index:999;justify-content:space-between;align-items:center;box-shadow:0 -2px 12px rgba(0,0,0,.2)}
.compare-bar .cb-items{display:flex;gap:16px;align-items:center;flex:1;overflow-x:auto}
.compare-bar .cb-item{display:flex;align-items:center;gap:6px;font-size:.85rem;white-space:nowrap}
.compare-bar .cb-item button{background:rgba(255,255,255,.15);border:none;color:white;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:.7rem;display:flex;align-items:center;justify-content:center}
.compare-bar .cb-actions{display:flex;gap:8px}
.compare-bar .cb-actions button{padding:8px 18px;border-radius:4px;border:none;font-weight:600;cursor:pointer;font-size:.8rem}
.compare-bar .cb-compare{background:#ffd814;color:#0f1111}
.compare-bar .cb-clear{background:rgba(255,255,255,.15);color:white}
.compare-table{width:100%;border-collapse:collapse}
.compare-table th,.compare-table td{padding:12px 16px;font-size:.9rem;border:1px solid #e7e7e7;vertical-align:top}
.compare-table th{background:#f0f2f2;text-align:left;font-weight:600;min-width:120px}
.compare-table td{text-align:center}
.compare-table td:first-child{text-align:left;background:#f8f8f8;font-weight:600}
.compare-table .ct-img{width:120px;height:120px;object-fit:contain}
.compare-table .ct-price{font-size:1.1rem;color:#b12704;font-weight:600}

.section-header{display:flex;align-items:baseline;gap:12px;padding:20px 15px 8px}
.section-header h2{font-size:1.3rem;color:#0f1111}
.section-header a{font-size:.85rem;color:#007185;text-decoration:none}
.section-header a:hover{color:#c7511f;text-decoration:underline}
.specs-table{width:100%;border-collapse:collapse;margin:16px 0}
.specs-table td{padding:8px 12px;font-size:.85rem;border:1px solid #e7e7e7}
.specs-table td:first-child{background:#f0f2f2;font-weight:600;width:200px}
.page-content{max-width:900px;margin:20px auto;background:white;border-radius:4px;padding:32px}
footer{background:#232f3e;color:white;margin-top:40px;padding:30px 0 15px}
footer .inner{max-width:1200px;margin:0 auto;padding:0 15px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}
footer h4{font-size:.9rem;margin-bottom:8px}
footer a{display:block;color:#ddd;text-decoration:none;font-size:.8rem;padding:2px 0}
footer a:hover{text-decoration:underline}
footer .bt{grid-column:1/-1;text-align:center;color:#999;font-size:.75rem;padding-top:16px;border-top:1px solid #3a4553}
@media(max-width:768px){.pdetail{grid-template-columns:1fr}}
</style></head><body>
<header><div class="top-nav"><div class="inner">
<a href="/index.html" class="logo">extora<span style="color:white">.in</span></a>
<div class="search"><div class="search-wrap"><input id="navSearch" placeholder="Search..." autocomplete="off" onkeyup="navSuggest(event)" onfocus="navSuggest(event)" onblur="setTimeout(()=>{const s=document.getElementById('navSuggestions');if(s)s.style.display='none'},200)"><div id="navSuggestions" class="search-suggestions"></div></div><button onclick="navGo()">Go</button></div>
<div class="nav-r" style="position:relative">
<a href="/account.html" id="headerAccount">Sign In</a>
<div id="accountDropdown" style="display:none;position:absolute;top:100%;right:0;background:white;border:1px solid #ddd;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.15);min-width:180px;z-index:100;padding:8px 0">
<a href="/account.html" style="display:block;padding:8px 16px;color:#0f1111;text-decoration:none;font-size:.85rem">My Account</a>
<a href="/orders.html" style="display:block;padding:8px 16px;color:#0f1111;text-decoration:none;font-size:.85rem">My Orders</a>
<hr style="margin:4px 0;border:none;border-top:1px solid #e7e7e7">
<a href="#" onclick="doHeaderLogout();return false" style="display:block;padding:8px 16px;color:#cc0c39;text-decoration:none;font-size:.85rem">Sign Out</a>
</div>
<a href="/orders.html">Orders</a>
<a href="#" style="font-weight:700" onclick="showWishlist();return false">Wishlist <span id="wishCount"></span></a>
<a href="#" style="font-weight:700" onclick="showCart();return false">Cart <span id="cartCount"></span></a>
</div>
</div></div>
<nav class="sub-nav"><div class="inner">
<a href="/index.html">All</a><a href="/products.html">Best Sellers</a><a href="/deals.html">Today's Deals</a><a href="/about.html">About</a></div></nav>
</header>
<main>${body}</main>
<footer><div class="inner">
<div><h4>Get to Know Us</h4><a href="/about.html">About</a></div>
<div><h4>Connect</h4><a href="#">Facebook</a><a href="#">Twitter</a><a href="#">Instagram</a></div>
<div><h4>Make Money</h4><a href="#">Sell</a><a href="#">Affiliate</a></div>
<div><h4>Let Us Help</h4><a href="/account.html">Your Account</a><a href="/orders.html">Your Orders</a><a href="#">Returns</a><a href="#">Help</a></div>
<div style="grid-column:1/-1;margin-top:12px;padding:16px 0;border-top:1px solid #3a4553;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
<span style="color:white;font-size:.9rem">Subscribe to our newsletter</span>
<input type="email" id="nlEmail" placeholder="Enter your email" style="flex:1;min-width:200px;padding:8px 12px;border:1px solid #3a4553;border-radius:4px;background:#131921;color:white;font-size:.85rem">
<button onclick="subscribeNewsletter()" style="padding:8px 20px;background:#febd69;border:none;border-radius:4px;font-weight:600;cursor:pointer;font-size:.85rem">Subscribe</button>
<span id="nlMsg" style="color:#4caf50;font-size:.8rem"></span>
</div>
<div class="bt">&copy; 2026 ${e(site.name)}. Published with Extora.</div>
</div></footer>
<script>
function getCart() { try { return JSON.parse(localStorage.getItem("extora_cart") || "[]"); } catch { return []; } }
function saveCart(c) { localStorage.setItem("extora_cart", JSON.stringify(c)); updateCartCount(); }
function updateCartCount() { const c = getCart(); const count = c.reduce((s,i) => s + i.qty, 0); const el = document.getElementById("cartCount"); if (el) el.textContent = count || ""; }
function addToCart(el) {
  const name = el.getAttribute("data-name") || "Product";
  const price = parseFloat(el.getAttribute("data-price") || "0");
  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty++; else cart.push({ name, price, qty: 1 });
  saveCart(cart);
  el.textContent = "✓"; el.style.background = "#007600"; el.style.color = "white"; el.style.borderColor = "#007600";
  setTimeout(() => { el.textContent = "Add to Cart"; el.style.background = ""; el.style.color = ""; el.style.borderColor = ""; }, 2000);
  const token = localStorage.getItem("at");
  if (token) fetch("/api/v1/commerce/cart/add", { method:"POST", headers:{"Content-Type":"application/json", Authorization:"Bearer "+token}, body: JSON.stringify({productId: name, name, price, qty: 1}) }).catch(() => {});
  return false;
}
function buyNow(el) {
  addToCart(el);
  setTimeout(() => showCart(), 300);
}
function removeFromCart(idx) { const c = getCart(); c.splice(idx,1); saveCart(c); showCart(); }
function showCart() {
  const cart = getCart();
  if (cart.length === 0) { alert("Your cart is empty"); return; }
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const items = cart.map((i, idx) => \`<tr><td>\${i.name}</td><td>₹\${i.price.toLocaleString("en-IN")}</td><td>\${i.qty}</td><td>₹\${(i.price*i.qty).toLocaleString("en-IN")}</td><td><button onclick="removeFromCart(\${idx})" style="background:#cc0c39;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer">Remove</button></td></tr>\`).join("");
  const html = \`<div style="max-width:800px;margin:20px auto;background:white;border-radius:8px;padding:24px"><h2>Shopping Cart</h2><table style="width:100%;border-collapse:collapse;margin:16px 0"><thead><tr style="background:#f0f2f2"><th style="text-align:left;padding:8px">Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead><tbody>\${items}</tbody><tfoot><tr style="font-weight:700;font-size:1.1rem"><td colspan="3" style="text-align:right;padding:12px">Total:</td><td style="padding:12px">₹\${total.toLocaleString("en-IN")}</td><td></td></tr></tfoot></table><button onclick="checkout()" style="padding:12px 32px;background:#ffd814;border:1px solid #fcd200;border-radius:20px;font-size:1rem;cursor:pointer;font-weight:600">Proceed to Checkout</button></div>\`;
  document.querySelector("main").innerHTML = html;
}
async function checkout() {
  const cart = getCart();
  if (cart.length === 0) { alert("Cart empty"); return; }
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const token = localStorage.getItem("at");
  const email = prompt("Enter your email for order confirmation:");
  if (!email) return;

  // Try API checkout if logged in
  let orderNumber = "EXT-" + Date.now().toString().slice(-6);
  if (token) {
    try {
      const API = "/api/v1/commerce";
      // Sync cart to API
      for (const item of cart) {
        await fetch(API + "/cart/add", { method:"POST", headers:{"Content-Type":"application/json", Authorization:"Bearer "+token}, body: JSON.stringify({productId: item.name, name: item.name, price: item.price, qty: item.qty}) });
      }
      const r = await fetch(API + "/checkout", { method:"POST", headers:{"Content-Type":"application/json", Authorization:"Bearer "+token}, body: JSON.stringify({email}) });
      const d = await r.json();
      if (d.data?.orderNumber) orderNumber = d.data.orderNumber;
    } catch { /* fall through to local checkout */ }
  }

  document.querySelector("main").innerHTML = \`<div style="max-width:600px;margin:40px auto;text-align:center;background:white;border-radius:8px;padding:40px"><h2>Order Confirmed!</h2><p style="font-size:1.2rem;margin:16px 0">Order #\${orderNumber}</p><p>\${cart.length} items · ₹\${total.toLocaleString("en-IN")}</p><p style="color:#565959;margin-top:8px">Confirmation sent to \${email}</p><a href="/orders.html" style="display:inline-block;margin-top:16px;color:#007185;text-decoration:none">View Orders</a> · <a href="/index.html" style="color:#007185;text-decoration:none;margin-left:12px">Continue Shopping</a></div>\`;
  localStorage.removeItem("extora_cart");
  updateCartCount();
}
document.addEventListener("click", function(e) {
  const btn = e.target.closest(".btn-cart, .add-cart");
  if (btn) { e.preventDefault(); addToCart(btn); }
});
document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
  updateWishCount();
  updateVisibleHearts();
  updateCompareBar();
  updateCompareChecks();
  trackPageView();
  const token = localStorage.getItem("at");
  const accEl = document.getElementById("headerAccount");
  const dropdown = document.getElementById("accountDropdown");
  if (token && accEl && dropdown) {
    fetch("/api/v1/auth/session", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json()).then(d => {
        if (d.user) {
          accEl.textContent = "Hello, " + (d.user.displayName || "User") + " ▼";
          accEl.href = "#";
          accEl.style.cursor = "pointer";
          accEl.onclick = function(e) { e.preventDefault(); dropdown.style.display = dropdown.style.display === "block" ? "none" : "block"; };
          document.addEventListener("click", function(ev) { if (!accEl.contains(ev.target) && !dropdown.contains(ev.target)) dropdown.style.display = "none"; });
        }
      }).catch(() => {});
  }
});
function doHeaderLogout() { localStorage.removeItem("at"); location.href = "/index.html"; }
function subscribeNewsletter() {
  const email = document.getElementById("nlEmail")?.value;
  const msg = document.getElementById("nlMsg");
  if (email && email.includes("@")) {
    fetch("/api/v1/subscribers", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({email}) })
      .then(r => r.json()).then(() => {
        localStorage.setItem("extora_subscriber", email);
        if (msg) { msg.textContent = "Subscribed!"; setTimeout(() => { if (msg) msg.textContent = ""; }, 3000); }
      }).catch(() => { if (msg) msg.textContent = "Error, try again"; });
  } else {
    if (msg) { msg.textContent = "Enter valid email"; }
  }
}

// Recently Viewed Products
function trackPageView() {
  const isProduct = window.location.pathname.includes("product-");
  if (!isProduct) return;
  const nameEl = document.querySelector(".pdetail h1, .product-detail h1");
  if (!nameEl) return;
  const name = nameEl.textContent.trim();
  let viewed = [];
  try { viewed = JSON.parse(localStorage.getItem("extora_viewed") || "[]"); } catch { viewed = []; }
  viewed = viewed.filter((v) => v.name !== name);
  viewed.unshift({ name, url: window.location.pathname, time: Date.now() });
  if (viewed.length > 8) viewed.pop();
  localStorage.setItem("extora_viewed", JSON.stringify(viewed));
  showRecentlyViewed(viewed);
}
function showRecentlyViewed(viewed) {
  if (viewed.length < 2) return;
  const container = document.createElement("div");
  container.className = "section-header";
  container.innerHTML = '<h2>Recently Viewed</h2>';
  const grid = document.createElement("div");
  grid.className = "products-grid";
  grid.innerHTML = viewed.slice(1, 5).map((v) => '<div class="product-card"><a href="' + v.url + '" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><span class="pname">' + v.name + '</span><span class="stock-ok">View Again</span></a></div>').join("");
  const pdetail = document.querySelector(".pdetail");
  if (pdetail) { pdetail.parentElement?.appendChild(container); pdetail.parentElement?.appendChild(grid); }
}
// ── Global Product Index (for search autocomplete) ──
var ALL_PRODUCTS = ${productJson};
function navSuggest(e) {
  const input = document.getElementById("navSearch");
  const sug = document.getElementById("navSuggestions");
  if (!input || !sug) return;
  const q = input.value.toLowerCase().trim();
  if (q.length < 1 || e.key === "Escape") { sug.style.display = "none"; return; }
  if (e.key === "Enter") { navGo(); return; }
  const matches = ALL_PRODUCTS.filter(function(p) { return p.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 6);
  if (matches.length === 0) { sug.style.display = "none"; return; }
  sug.innerHTML = matches.map(function(p) {
    var idx = p.name.toLowerCase().indexOf(q);
    if (idx === -1) return '<div class="sug-item" onclick="location.href=\\'/product-'+p.slug+'.html\\'"><span class="sug-name">'+p.name+'</span><span class="sug-cat">'+p.category+'</span><span class="sug-price">₹'+p.price.toLocaleString("en-IN")+'</span></div>';
    var highlighted = p.name.substring(0,idx) + '<span class="sug-highlight">' + p.name.substring(idx,idx+q.length) + '</span>' + p.name.substring(idx+q.length);
    return '<div class="sug-item" onclick="location.href=\\'/product-'+p.slug+'.html\\'">' +
      '<span class="sug-name">'+highlighted+'</span>' +
      '<span class="sug-cat">'+p.category+'</span>' +
      '<span class="sug-price">₹'+p.price.toLocaleString("en-IN")+'</span></div>';
  }).join("");
  sug.style.display = "block";
}
function navGo() {
  const input = document.getElementById("navSearch");
  if (input && input.value.trim()) location.href = "/search.html?q=" + encodeURIComponent(input.value.trim());
}
// ── Wishlist ──
function getWishlist() { try { return JSON.parse(localStorage.getItem("extora_wishlist") || "[]"); } catch { return []; } }
function saveWishlist(w) { localStorage.setItem("extora_wishlist", JSON.stringify(w)); updateWishCount(); }
function updateWishCount() { const w = getWishlist(); const el = document.getElementById("wishCount"); if (el) el.textContent = w.length || ""; }
function toggleWishlist(el) {
  const slug = el.getAttribute("data-slug");
  const name = el.getAttribute("data-name");
  const w = getWishlist();
  const idx = w.findIndex(function(i) { return i.slug === slug; });
  if (idx === -1) { w.push({ slug: slug, name: name }); el.textContent = "♥"; el.classList.add("active"); }
  else { w.splice(idx, 1); el.textContent = "♡"; el.classList.remove("active"); }
  saveWishlist(w);
}
function showWishlist() {
  const w = getWishlist();
  if (w.length === 0) { alert("Your wishlist is empty"); return; }
  var items = w.map(function(i, idx) {
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #e7e7e7">' +
      '<span style="flex:1;color:#0f1111">' + i.name + '</span>' +
      '<a href="/product-' + i.slug + '.html" style="color:#007185;text-decoration:none;font-size:.85rem">View</a>' +
      '<button onclick="removeWish(' + idx + ')" style="background:none;border:1px solid #ddd;color:#cc0c39;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:.8rem">Remove</button></div>';
  }).join("");
  document.querySelector("main").innerHTML = '<div style="max-width:800px;margin:20px auto;background:white;border-radius:8px;padding:24px"><h2>My Wishlist (' + w.length + ')</h2><div style="margin:16px 0">' + items + '</div></div>';
}
function removeWish(idx) { var w = getWishlist(); w.splice(idx, 1); saveWishlist(w); showWishlist(); updateVisibleHearts(); }
function updateVisibleHearts() {
  var w = getWishlist();
  var slugs = w.map(function(i) { return i.slug; });
  var hearts = document.querySelectorAll(".wishlist-btn");
  hearts.forEach(function(h) {
    if (slugs.indexOf(h.getAttribute("data-slug")) !== -1) { h.textContent = "♥"; h.classList.add("active"); }
    else { h.textContent = "♡"; h.classList.remove("active"); }
  });
}
// ── Compare Products ──
function getCompare() { try { return JSON.parse(localStorage.getItem("extora_compare") || "[]"); } catch { return []; } }
function saveCompare(c) { localStorage.setItem("extora_compare", JSON.stringify(c)); updateCompareBar(); updateCompareChecks(); }
function updateCompareBar() {
  const c = getCompare(); const bar = document.getElementById("compareBar");
  const items = document.getElementById("compareItems");
  if (!bar || !items) return;
  if (c.length === 0) { bar.style.display = "none"; return; }
  bar.style.display = "flex";
  items.innerHTML = c.map(function(i, idx) {
    return '<div class="cb-item"><span>' + i.name + '</span><button onclick="removeCompare(' + idx + ')">✕</button></div>';
  }).join("");
}
function updateCompareChecks() {
  var c = getCompare(); var slugs = c.map(function(i) { return i.slug; });
  document.querySelectorAll(".compare-check").forEach(function(el) {
    if (slugs.indexOf(el.getAttribute("data-slug")) !== -1) { el.textContent = "☑"; el.classList.add("checked"); }
    else { el.textContent = "◻"; el.classList.remove("checked"); }
  });
}
function toggleCompare(el) {
  var slug = el.getAttribute("data-slug");
  var c = getCompare(); var idx = c.findIndex(function(i) { return i.slug === slug; });
  if (idx !== -1) { c.splice(idx, 1); }
  else if (c.length < 3) { c.push({slug: slug, name: el.getAttribute("data-name"), price: el.getAttribute("data-price"), category: el.getAttribute("data-category"), brand: el.getAttribute("data-brand"), img: el.getAttribute("data-img"), rating: el.getAttribute("data-rating"), reviews: el.getAttribute("data-reviews")}); }
  else { alert("Compare up to 3 products"); return; }
  saveCompare(c);
}
function removeCompare(idx) { var c = getCompare(); c.splice(idx, 1); saveCompare(c); }
function clearCompare() { localStorage.removeItem("extora_compare"); updateCompareBar(); updateCompareChecks(); }
function showCompare() { location.href = "/compare.html"; }
</script>
<div class="compare-bar" id="compareBar" style="display:none">
<div class="cb-items" id="compareItems"></div>
<div class="cb-actions">
<button class="cb-clear" onclick="clearCompare()">Clear</button>
<button class="cb-compare" onclick="showCompare()">Compare Now</button>
</div>
</div>
</body></html>`;
}

function productCard(p: any): string {
  const img = p.images?.[0] ?? "";
  const price = Number(p.price ?? 0);
  const mrp = p.mrp ? Number(p.mrp) : null;
  const discount = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : (p.discountPercent ? Number(p.discountPercent) : 0);
  const rating = Number(p.rating ?? 0);
  return `<div class="product-card">
<a href="/product-${e(p.slug)}.html">
<span class="wishlist-btn" data-slug="${e(p.slug)}" data-name="${e(p.name)}" onclick="toggleWishlist(this);event.preventDefault();event.stopPropagation()">♡</span>
<span class="compare-check" onclick="toggleCompare(this);event.preventDefault();event.stopPropagation()" data-slug="${e(p.slug)}" data-name="${e(p.name)}" data-price="${price}" data-category="${e(p.category)}" data-brand="${e(p.brand)}" data-img="${e(img)}" data-rating="${rating}" data-reviews="${p.reviews ?? 0}">◻</span>
<div class="img-wrap">${img ? `<img src="${e(img)}" alt="" loading="lazy">` : "No Image"}</div>
<span class="pname">${e(p.name)}</span>
${rating > 0 ? `<span class="stars">${stars(rating)}</span>` : ""}
<div class="pr"><span class="p">${rupee(price)}</span>${mrp && mrp > price ? `<span class="mrp">${rupee(mrp)}</span>` : ""}</div>
${discount > 0 ? `<span class="badge">-${discount}%</span>` : ""}
${p.dealType ? `<span class="badge" style="background:#c45500">${e(p.dealLabel ?? p.dealType)}</span>` : ""}
<span class="stock-ok" style="display:flex;align-items:center">In Stock<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#ffd814;border:1px solid #fcd200;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="${e(p.name)}" data-price="${price}" onclick="addToCart(this);return false">Add to Cart</button></span>
</a>
</div>`;
}

export async function publishSite(prisma: PrismaClient, logger: Logger): Promise<PublishedSite> {
  const siteName = String((await prisma.systemConfig.findUnique({ where: { key: "site_name" } }))?.value ?? "Extora.in");
  const outputDir = process.env.PUBLISH_DIR ?? join(process.cwd(), "published");
  if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true });

  const pages: PageData[] = [];
  const products = await (prisma as any).product.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 50 });
  const categories = await (prisma as any).productCategory.findMany({ orderBy: { name: "asc" } });
  const contentEntries = await (prisma as any).contentEntry.findMany({ where: { status: "published" } });
  const deals = products.filter((p: any) => p.dealType);
  const site = { name: siteName };

  // ── HOMEPAGE ──
  const hpSections: string[] = [];
  if (deals.length > 0) hpSections.push(`<div class="section-header"><h2>Today's Deals</h2><a href="/deals.html">See all</a></div><div class="products-grid">${deals.slice(0, 6).map(productCard).join("")}</div>`);
  // Trending: sort by rating * reviews (popularity score)
  const trending = [...products].sort((a: any, b: any) => ((b.rating ?? 0) * (b.reviews ?? 1)) - ((a.rating ?? 0) * (a.reviews ?? 1)));
  hpSections.push(`<div class="section-header"><h2>Trending Products</h2><a href="/products.html">See all</a></div><div class="products-grid">${trending.slice(0, 8).map(productCard).join("")}</div>`);
  const featured = products.slice(0, 12);
  hpSections.push(`<div class="section-header"><h2>Featured Products</h2></div><div class="products-grid">${featured.map(productCard).join("")}</div>`);
  if (categories.length) hpSections.push(`<div class="section-header"><h2>Shop by Category</h2></div><div style="max-width:1500px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding:0 15px 20px">${categories.slice(0, 6).map((c: any) => `<div style="background:white;padding:20px;border-radius:4px"><h3>${e(c.name)}</h3><p style="color:#565959;font-size:.85rem">${e(c.description)}</p><a href="/category-${e(c.slug)}.html" style="color:#007185;font-size:.85rem;text-decoration:none">Shop now</a></div>`).join("")}</div>`);
  // Recently Viewed (client-side render)
  hpSections.push(`<div id="homeRecentlyViewed"></div><script>try{var v=JSON.parse(localStorage.getItem("extora_viewed")||"[]");if(v.length>0){document.getElementById("homeRecentlyViewed").innerHTML='<div class="section-header"><h2>Recently Viewed</h2></div><div class="products-grid">'+v.slice(0,6).map(function(x){return'<div class="product-card"><a href="'+x.url+'" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><span class="pname">'+x.name+'</span><span class="stock-ok">View Again</span></a></div>'}).join("")+'</div>'}}catch(e){}</script>`);
  pages.push({ slug: "index", title: siteName, description: "Online Shopping", content: `<div style="background:linear-gradient(180deg,#3a5a8c 0,#131921 350px,#eaeded 350px);padding:30px 15px 60px"><div style="max-width:1500px;margin:0 auto"><h1 style="font-size:2rem;color:white;text-shadow:0 1px 2px rgba(0,0,0,.3)">${e(siteName)}</h1><p style="color:rgba(255,255,255,.9);font-size:1.1rem">Great products, great prices</p></div></div>${hpSections.join("")}` });

  // ── PRODUCT DETAIL PAGES (Amazon.in style) ──
  for (const p of products) {
    const imgs = (Array.isArray(p.images) ? p.images.map(String) : []) as string[];
    const price = Number(p.price ?? 0);
    const mrp = p.mrp ? Number(p.mrp) : null;
    const discount = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : (p.discountPercent ? Number(p.discountPercent) : 0);
    const rating = Number(p.rating ?? 0);
    const emiPrice = p.emiAvailable ? Math.round(price / (p.emiPrice ? Number(p.emiPrice) : 12)) : 0;
    const offers: string[] = Array.isArray(p.offers) ? p.offers.map(String) : [];
    if (discount > 0) offers.unshift(`Save extra with No Cost EMI`);
    if (!offers.length) offers.push("No Cost EMI on select cards", "Bank Offer: 10% off on ICICI Bank Cards", "Partner Offer: Get GST invoice & bulk discounts");

    const highlights: string[] = Array.isArray(p.highlights) ? p.highlights.map(String) : [];
    if (!highlights.length) highlights.push("High quality material", "Durable & long lasting", "Easy to use", "1 year warranty");

    const specs = (typeof p.specs === "object" && p.specs ? p.specs : {}) as Record<string, string>;
    const specRows = Object.entries(specs).map(([k, v]) => `<tr><td>${e(k)}</td><td>${e(v)}</td></tr>`).join("");

    pages.push({
      slug: `product-${e(p.slug)}`,
      title: String(p.name),
      description: String(p.shortDesc ?? "").slice(0, 160),
      content: `<div class="breadcrumb"><a href="/">Home</a> › <a href="/products.html">Products</a> › <span style="color:#c45500">${e(p.name)}</span></div>
<div class="container"><div class="pdetail">
<div class="gallery">
${imgs.length > 0 ? `<img src="${e(imgs[0])}" class="main-img" alt="${e(p.name)}">` : `<div class="main-img" style="display:flex;align-items:center;justify-content:center;color:#999;background:white">No Image</div>`}
<div class="thumbs">${imgs.slice(0, 5).map((i) => `<img src="${e(i)}" alt="">`).join("")}</div>
</div>
<div>
<h1>${e(p.name)}</h1>
${rating > 0 ? `<div class="rating-row"><span class="stars">${stars(rating)}</span><span class="revs">${p.reviews ?? 0} ratings</span></div>` : ""}
<hr class="divider">
${mrp && mrp > price ? `<div class="mrp-row">M.R.P: <span class="mrp">${rupee(mrp)}</span></div>` : ""}
<div class="price-row"><span class="price">${rupee(discount > 0 && mrp ? mrp > price ? price : price : price)}</span>${discount > 0 ? `<span class="discount">-${discount}%</span>` : ""}</div>
<div class="tax">Inclusive of all taxes</div>
${p.emiAvailable ? `<div class="emi">EMI starts at <span class="price">${rupee(emiPrice)}</span>. No Cost EMI available</div>` : ""}
<div class="offers"><h4>Offers</h4><ul>${offers.map((o: string) => `<li>${e(o)}</li>`).join("")}</ul></div>
<div class="features"><h4>Highlights</h4><ul>${highlights.map((h: string) => `<li>${e(h)}</li>`).join("")}</ul></div>
<div class="stock">In Stock</div>
<div class="delivery">FREE delivery <strong>${e(p.deliveryDate ?? "Tomorrow")}</strong>. <a href="#" style="color:#007185">Details</a></div>
<div class="delivery">Delivered by <strong>${e(p.deliveryInfo ?? "Amazon")}</strong></div>
${p.codAvailable ? `<div class="cod">Cash on Delivery available</div>` : ""}
<div class="qty-row">Quantity: <select>${[1,2,3,4,5].map((n) => `<option value="${n}">${n}</option>`).join("")}</select></div>
<div class="buttons">
<button class="btn-cart" data-name="${e(p.name)}" data-price="${p.price ?? 0}" onclick="addToCart(this);return false">Add to Cart</button>
<button class="btn-buy" data-name="${e(p.name)}" data-price="${p.price ?? 0}" onclick="buyNow(this);return false">Buy Now</button>
</div>
<div class="secure">🔒 Secure transaction</div>
<div class="seller-info">Sold by <strong>${e(p.sellerName ?? "Extora Seller")}</strong> (${p.sellerRating ? stars(Number(p.sellerRating)) : "★★★★"} ${p.sellerRating ?? "4.0"})</div>
<div class="warranty"><strong>Warranty:</strong> ${e(p.warranty ?? "1 Year Manufacturer Warranty")}</div>
<div class="return">✓ ${e(p.returnPolicy ?? "7 days returnable")}</div>
<hr class="divider">
<h4 style="margin:12px 0 8px">Product Description</h4>
<div style="font-size:.9rem;color:#0f1111;line-height:1.7">${String(p.description ?? "")}</div>
${specRows ? `<h4 style="margin:16px 0 8px">Technical Specifications</h4><table class="specs-table">${specRows}</table>` : ""}
</div>
</div>

<div style="max-width:1200px;margin:20px auto;background:white;border-radius:4px;padding:28px" id="reviews-${e(p.slug)}">
<h3 style="margin-bottom:16px">Customer Reviews</h3>
<div id="reviewList-${e(p.slug)}" style="margin-bottom:20px">
<p style="color:#565959;font-size:.9rem" id="reviewLoading-${e(p.slug)}">Loading reviews...</p>
</div>
<div style="border-top:1px solid #e7e7e7;padding-top:16px">
<h4 style="margin-bottom:12px">Write a Review</h4>
<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px" id="starInput-${e(p.slug)}">
${[1,2,3,4,5].map((n) => `<span onclick="setRating('${e(p.slug)}',${n})" style="font-size:1.5rem;cursor:pointer;color:#ddd" id="star${n}-${e(p.slug)}">★</span>`).join("")}
</div>
<input type="hidden" id="ratingVal-${e(p.slug)}" value="5">
<input type="text" id="reviewTitle-${e(p.slug)}" placeholder="Review title" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;margin-bottom:8px;font-size:.9rem">
<textarea id="reviewContent-${e(p.slug)}" placeholder="Share your experience..." rows="3" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:.9rem;resize:vertical"></textarea>
<input type="text" id="reviewName-${e(p.slug)}" placeholder="Your name" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;margin:8px 0;font-size:.9rem">
<button onclick="submitReview('${e(p.slug)}','${e(p.id)}')" style="padding:10px 24px;background:#ffd814;border:1px solid #fcd200;border-radius:20px;cursor:pointer;font-weight:600">Submit Review</button>
<span id="reviewMsg-${e(p.slug)}" style="color:#007600;margin-left:12px;font-size:.85rem"></span>
</div>
</div>
<script>
function setRating(slug, n) { document.getElementById("ratingVal-"+slug).value = n; for(let i=1;i<=5;i++) document.getElementById("star"+i+"-"+slug).style.color = i<=n ? "#febd69" : "#ddd"; }
function submitReview(slug, productId) {
  const rating = document.getElementById("ratingVal-"+slug).value;
  const title = document.getElementById("reviewTitle-"+slug).value;
  const content = document.getElementById("reviewContent-"+slug).value;
  const author = document.getElementById("reviewName-"+slug).value || "Anonymous";
  const msg = document.getElementById("reviewMsg-"+slug);
  fetch("/api/v1/reviews", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({productId, rating:Number(rating), title, content, author}) })
    .then(r => r.json()).then(() => { msg.textContent = "Review submitted! Pending approval."; })
    .catch(() => { msg.textContent = "Failed to submit"; });
}
fetch("/api/v1/reviews/${e(p.id)}").then(r => r.json()).then(d => {
  const reviews = d.data || [];
  const el = document.getElementById("reviewList-${e(p.slug)}");
  if (reviews.length === 0) { el.innerHTML = '<p style="color:#565959;font-size:.9rem">No reviews yet. Be the first!</p>'; return; }
  el.innerHTML = reviews.map(r => '<div style="border-bottom:1px solid #e7e7e7;padding:12px 0"><div style="color:#febd69;margin-bottom:4px">'+"★".repeat(r.rating)+"☆".repeat(5-r.rating)+' <strong>'+r.title+'</strong></div><p style="color:#0f1111;font-size:.9rem;margin:4px 0">'+r.content+'</p><span style="color:#565959;font-size:.8rem">By '+r.author+' on '+new Date(r.createdAt).toLocaleDateString()+'</span></div>').join("");
}).catch(() => { document.getElementById("reviewLoading-${e(p.slug)}").textContent = "No reviews yet."; });
</script>

<div class="section-header"><h2>Frequently Bought Together</h2></div>
<div class="products-grid">${(function() { const upsellIds: string[] = Array.isArray(p.upSellIds) ? p.upSellIds.map(String).filter(Boolean) : []; const crossSellIds: string[] = Array.isArray(p.crossSellIds) ? p.crossSellIds.map(String).filter(Boolean) : []; const fbt: any[] = []; for (const id of [...upsellIds, ...crossSellIds]) { const found = products.find((x: any) => String(x.id) === id || String(x.slug) === id); if (found) fbt.push(found); } if (fbt.length < 4) { for (const x of products) { if (x.id !== p.id && String(x.category) === String(p.category) && !fbt.find((f: any) => f.id === x.id)) { fbt.push(x); if (fbt.length >= 4) break; } } } return fbt.slice(0, 4).map(productCard).join(""); })()}</div>

<div class="section-header"><h2>Customers Also Bought</h2></div>
<div class="products-grid">${products.filter((x: any) => x.id !== p.id && String(x.category) === String(p.category)).sort((a: any, b: any) => ((b.rating ?? 0) * (b.reviews ?? 1)) - ((a.rating ?? 0) * (a.reviews ?? 1))).slice(0, 6).map(productCard).join("")}</div>
</div>`,
    });
  }

  // ── CATEGORY, DEALS, PRODUCTS LISTING ──
  const productJson2 = JSON.stringify(products.map((p: any) => ({
    id: String(p.id ?? ""), name: String(p.name ?? ""), price: Number(p.price ?? 0),
    mrp: p.mrp ? Number(p.mrp) : null, slug: String(p.slug ?? ""),
    category: String(p.category ?? ""), brand: String(p.brand ?? ""),
    rating: Number(p.rating ?? 0), reviews: Number(p.reviews ?? 0),
    img: Array.isArray(p.images) && p.images.length > 0 ? String(p.images[0]) : "",
    deal: p.dealType ? String(p.dealLabel ?? p.dealType) : null,
    discountPercent: Number(p.discountPercent ?? 0), createdAt: String(p.createdAt ?? ""),
  })));


  for (const cat of categories) {
    const catSlug = e(cat.slug); const catName = e(cat.name);
    pages.push({ slug: `category-${catSlug}`, title: String(cat.name), description: String(cat.description ?? ""),
      content: `<div class="page-content">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
<h1 style="margin:0">${catName}</h1>
<div style="display:flex;align-items:center;gap:8px">
<span style="color:#565959;font-size:.85rem" id="resultCount"></span>
<select id="sortSelect" onchange="sortCategory()" style="padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:.85rem;background:white;cursor:pointer">
<option value="default">Sort by: Featured</option>
<option value="priceAsc">Price: Low to High</option>
<option value="priceDesc">Price: High to Low</option>
<option value="rating">Rating: High to Low</option>
<option value="newest">Newest First</option>
<option value="discount">Biggest Discount</option>
</select>
</div>
</div>
<div id="productsGrid" class="products-grid"></div>
</div>
<script>
var PRODUCTS = ${productJson2};
var CATEGORY = "${catName}";
function sortCategory() {
  var sort = document.getElementById("sortSelect").value;
  var list = PRODUCTS.filter(function(p){return p.category === CATEGORY});
  if (sort === "priceAsc") list.sort(function(a,b){return a.price - b.price});
  else if (sort === "priceDesc") list.sort(function(a,b){return b.price - a.price});
  else if (sort === "rating") list.sort(function(a,b){return (b.rating||0) - (a.rating||0)});
  else if (sort === "newest") list.sort(function(a,b){return (b.createdAt||"").localeCompare(a.createdAt||"")});
  else if (sort === "discount") list.sort(function(a,b){return (b.discountPercent||0) - (a.discountPercent||0)});
  document.getElementById("resultCount").textContent = list.length + " products";
  document.getElementById("productsGrid").innerHTML = list.length === 0 ? '<p style="text-align:center;padding:60px;color:#565959;grid-column:1/-1">No products in this category yet.</p>' : list.map(function(p){
    var mrp = p.mrp && p.mrp > p.price ? '<span class="mrp" style="font-size:.8rem;color:#565959;text-decoration:line-through">&#' + '8377;' + p.mrp.toLocaleString("en-IN") + '</span>' : '';
    var discount = p.mrp && p.mrp > p.price ? '<span class="badge">-' + Math.round((1-p.price/p.mrp)*100) + '%</span>' : '';
    return '<div class="product-card"><a href="/product-'+p.slug+'.html" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%">' +
    '<span class="wishlist-btn" data-slug="'+p.slug+'" data-name="'+p.name.replace(/'/g,"&#39;")+'" onclick="toggleWishlist(this);event.preventDefault();event.stopPropagation()">♡</span>' +
    '<span class="compare-check" onclick="toggleCompare(this);event.preventDefault();event.stopPropagation()" data-slug="'+p.slug+'" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" data-category="'+p.category+'" data-brand="'+(p.brand||"")+'" data-img="'+p.img+'" data-rating="'+(p.rating||0)+'" data-reviews="'+(p.reviews||0)+'">◻</span>' +
    (p.img ? '<div class="img-wrap"><img src="'+p.img+'" alt="" loading="lazy"></div>' : '<div class="img-wrap">No Image</div>') +
    '<span class="pname">'+p.name+'</span>' +
    (p.rating > 0 ? '<span class="stars">'+"★".repeat(Math.floor(p.rating))+"☆".repeat(5-Math.floor(p.rating))+'</span>' : '') +
    '<div class="pr"><span class="p">&#' + '8377;' + p.price.toLocaleString("en-IN") + '</span>'+mrp+'</div>'+discount+
    (p.deal ? '<span class="badge" style="background:#c45500">'+p.deal+'</span>' : '') +
    '<span class="stock-ok" style="display:flex;align-items:center">In Stock<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#ffd814;border:1px solid #fcd200;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" onclick="addToCart(this);return false">Add to Cart</button></span></a></div>';
  }).join("");
  updateVisibleHearts(); updateCompareChecks();
}
sortCategory();
</script>` });
  }
  if (deals.length) pages.push({ slug: "deals", title: "Today's Deals", description: "Limited time offers",
    content: `<div class="page-content">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
<h1 style="margin:0">Today's Deals</h1>
<div style="display:flex;align-items:center;gap:8px">
<span style="color:#565959;font-size:.85rem" id="resultCount"></span>
<select id="sortSelect" onchange="sortDeals()" style="padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:.85rem;background:white;cursor:pointer">
<option value="priceAsc">Price: Low to High</option>
<option value="priceDesc">Price: High to Low</option>
<option value="discount">Biggest Discount</option>
<option value="rating">Rating</option>
</select>
</div>
</div>
<div id="productsGrid" class="products-grid"></div>
</div>
<script>
var PRODUCTS = ${productJson2};
function sortDeals() {
  var sort = document.getElementById("sortSelect").value;
  var list = PRODUCTS.filter(function(p){return p.deal});
  if (sort === "priceAsc") list.sort(function(a,b){return a.price - b.price});
  else if (sort === "priceDesc") list.sort(function(a,b){return b.price - a.price});
  else if (sort === "discount") list.sort(function(a,b){return (b.discountPercent||0) - (a.discountPercent||0)});
  else if (sort === "rating") list.sort(function(a,b){return (b.rating||0) - (a.rating||0)});
  document.getElementById("resultCount").textContent = list.length + " deals";
  document.getElementById("productsGrid").innerHTML = list.map(function(p){
    var mrp = p.mrp && p.mrp > p.price ? '<span class="mrp" style="font-size:.8rem;color:#565959;text-decoration:line-through">&#' + '8377;' + p.mrp.toLocaleString("en-IN") + '</span>' : '';
    var discount = p.mrp && p.mrp > p.price ? '<span class="badge">-' + Math.round((1-p.price/p.mrp)*100) + '%</span>' : '';
    return '<div class="product-card"><a href="/product-'+p.slug+'.html" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%">' +
    '<span class="wishlist-btn" data-slug="'+p.slug+'" data-name="'+p.name.replace(/'/g,"&#39;")+'" onclick="toggleWishlist(this);event.preventDefault();event.stopPropagation()">♡</span>' +
    '<span class="compare-check" onclick="toggleCompare(this);event.preventDefault();event.stopPropagation()" data-slug="'+p.slug+'" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" data-category="'+p.category+'" data-brand="'+(p.brand||"")+'" data-img="'+p.img+'" data-rating="'+(p.rating||0)+'" data-reviews="'+(p.reviews||0)+'">◻</span>' +
    (p.img ? '<div class="img-wrap"><img src="'+p.img+'" alt="" loading="lazy"></div>' : '<div class="img-wrap">No Image</div>') +
    '<span class="pname">'+p.name+'</span>' +
    (p.rating > 0 ? '<span class="stars">'+"★".repeat(Math.floor(p.rating))+"☆".repeat(5-Math.floor(p.rating))+'</span>' : '') +
    '<div class="pr"><span class="p">&#' + '8377;' + p.price.toLocaleString("en-IN") + '</span>'+mrp+'</div>'+discount+
    '<span class="badge" style="background:#c45500">'+p.deal+'</span>' +
    '<span class="stock-ok" style="display:flex;align-items:center">In Stock<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#ffd814;border:1px solid #fcd200;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" onclick="addToCart(this);return false">Add</button></span></a></div>';
  }).join("");
  updateVisibleHearts(); updateCompareChecks();
}
sortDeals();
</script>` });
  pages.push({ slug: "products", title: "All Products", description: "Browse all",
    content: `<div class="page-content">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
<h1 style="margin:0">All Products</h1>
<div style="display:flex;align-items:center;gap:8px">
<span style="color:#565959;font-size:.85rem" id="resultCount"></span>
<select id="sortSelect" onchange="sortProducts()" style="padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:.85rem;background:white;cursor:pointer">
<option value="default">Sort by: Featured</option>
<option value="priceAsc">Price: Low to High</option>
<option value="priceDesc">Price: High to Low</option>
<option value="rating">Rating: High to Low</option>
<option value="newest">Newest First</option>
<option value="discount">Biggest Discount</option>
</select>
</div>
</div>
<div id="productsGrid" class="products-grid"></div>
</div>
<script>
var PRODUCTS = ${productJson2};
function sortProducts() {
  var sort = document.getElementById("sortSelect").value;
  var list = PRODUCTS.slice();
  if (sort === "priceAsc") list.sort(function(a,b){return a.price - b.price});
  else if (sort === "priceDesc") list.sort(function(a,b){return b.price - a.price});
  else if (sort === "rating") list.sort(function(a,b){return (b.rating||0) - (a.rating||0)});
  else if (sort === "newest") list.sort(function(a,b){return (b.createdAt||"").localeCompare(a.createdAt||"")});
  else if (sort === "discount") list.sort(function(a,b){return (b.discountPercent||0) - (a.discountPercent||0)});
  document.getElementById("resultCount").textContent = list.length + " products";
  document.getElementById("productsGrid").innerHTML = list.map(function(p){
    var mrp = p.mrp && p.mrp > p.price ? '<span class="mrp" style="font-size:.8rem;color:#565959;text-decoration:line-through">&#' + '8377;' + p.mrp.toLocaleString("en-IN") + '</span>' : '';
    var discount = p.mrp && p.mrp > p.price ? '<span class="badge">-' + Math.round((1-p.price/p.mrp)*100) + '%</span>' : '';
    return '<div class="product-card"><a href="/product-'+p.slug+'.html" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%">' +
    '<span class="wishlist-btn" data-slug="'+p.slug+'" data-name="'+p.name.replace(/'/g,"&#39;")+'" onclick="toggleWishlist(this);event.preventDefault();event.stopPropagation()">♡</span>' +
    '<span class="compare-check" onclick="toggleCompare(this);event.preventDefault();event.stopPropagation()" data-slug="'+p.slug+'" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" data-category="'+p.category+'" data-brand="'+(p.brand||"")+'" data-img="'+p.img+'" data-rating="'+(p.rating||0)+'" data-reviews="'+(p.reviews||0)+'">◻</span>' +
    (p.img ? '<div class="img-wrap"><img src="'+p.img+'" alt="" loading="lazy"></div>' : '<div class="img-wrap">No Image</div>') +
    '<span class="pname">'+p.name+'</span>' +
    (p.rating > 0 ? '<span class="stars">'+"★".repeat(Math.floor(p.rating))+"☆".repeat(5-Math.floor(p.rating))+'</span>' : '') +
    '<div class="pr"><span class="p">&#' + '8377;' + p.price.toLocaleString("en-IN") + '</span>'+mrp+'</div>'+discount+
    (p.deal ? '<span class="badge" style="background:#c45500">'+p.deal+'</span>' : '') +
    '<span class="stock-ok" style="display:flex;align-items:center">In Stock<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#ffd814;border:1px solid #fcd200;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" onclick="addToCart(this);return false">Add to Cart</button></span></a></div>';
  }).join("");
  updateVisibleHearts(); updateCompareChecks();
}
sortProducts();
</script>` });

  function renderBuilderElement(el: any): string {
  const c = el.content ?? {};
  switch (el.type) {
    case "heading": return `<${c.level ?? "h2"} style="text-align:${c.align ?? "left"};color:${c.color ?? "#0f1111"};font-weight:700;margin:12px 0">${e(c.text)}</${c.level ?? "h2"}>`;
    case "text": return `<p style="text-align:${c.align ?? "left"};font-size:${c.size ?? "16"}px;color:${c.color ?? "#333"};line-height:1.7;padding:8px 0">${e(c.text)}</p>`;
    case "button": return `<div style="text-align:${c.align ?? "center"};padding:16px 0"><a href="${e(c.url)}" style="display:inline-block;padding:14px 36px;background:${c.bgColor ?? "#ffd814"};color:${c.textColor ?? "#0f1111"};border-radius:8px;text-decoration:none;font-weight:600;font-size:${c.size ?? "16"}px">${e(c.text)}</a></div>`;
    case "image": return `<div style="padding:12px 0"><img src="${e(c.src)}" alt="${e(c.alt)}" style="width:${c.width ?? "100%"};border-radius:${c.borderRadius ?? "8"}px;max-width:100%" /></div>`;
    case "video": return `<div style="padding:12px 0"><video src="${e(c.src)}" poster="${e(c.poster)}" controls style="width:${c.width ?? "100%"};max-height:${c.height ?? "400"}px;border-radius:8px"></video></div>`;
    case "spacer": return `<div style="height:${c.height ?? "40"}px"></div>`;
    case "divider": return `<hr style="border:none;border-top:${c.thickness ?? "1"}px solid ${c.color ?? "#e7e7e7"};margin:16px 0" />`;
    case "hero": return `<div style="background:${c.bgColor ?? "#232f3e"};color:${c.textColor ?? "white"};padding:80px 40px;text-align:center;border-radius:8px;min-height:${c.height ?? "300"}px;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:16px 0"><h2 style="font-size:2.2rem;margin:0 0 8px">${e(c.title)}</h2><p style="font-size:1.2rem;opacity:0.9;margin:0">${e(c.subtitle)}</p></div>`;
    case "columns2": return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:${c.gap ?? "24"}px;padding:16px 0"><div style="padding:20px;background:#f8f8f8;border-radius:4px">${e(c.leftText)}</div><div style="padding:20px;background:#f8f8f8;border-radius:4px">${e(c.rightText)}</div></div>`;
    case "columns3": return `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:${c.gap ?? "16"}px;padding:16px 0">${[1,2,3].map((n) => `<div style="padding:16px;background:#f8f8f8;border-radius:4px">${e(c[`col${n}`] ?? `Column ${n}`)}</div>`).join("")}</div>`;
    case "products": {
      const cols = Number(c.columns ?? 4);
      return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:0;padding:16px 0;background:white">${Array.from({ length: Math.min(Number(c.count ?? 8), 12) }).map(() => `<div style="border:1px solid #f0f0f0;padding:16px;text-align:center"><div style="height:180px;background:#f7f7f7;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#999">Product</div><p style="font-size:.9rem;color:#0f1111;margin-bottom:4px">Sample Item</p><p style="font-size:1.1rem;font-weight:600;color:#b12704">₹999</p></div>`).join("")}</div>`;
    }
    case "deals": return `<div style="background:${c.bgColor ?? "#cc0c39"};color:white;padding:50px 40px;text-align:center;border-radius:8px;margin:16px 0"><h2 style="font-size:1.8rem;margin:0 0 8px">${e(c.title)}</h2><p style="font-size:1.2rem;opacity:0.9;margin:0">${e(c.subtitle)}</p><a href="/deals.html" style="display:inline-block;margin-top:16px;padding:12px 32px;background:white;color:#cc0c39;border-radius:8px;text-decoration:none;font-weight:600">Shop Deals</a></div>`;
    case "categories": return `<div style="display:grid;grid-template-columns:repeat(${c.columns ?? "3"},1fr);gap:${c.gap ?? "16"}px;padding:16px 0">${Array.from({ length: Math.min(Number(c.count ?? 6), 8) }).map((_, i) => `<div style="background:white;padding:20px;border-radius:8px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.08)"><h3 style="margin:0 0 4px">Category ${i + 1}</h3><p style="color:#565959;font-size:.85rem;margin:0">Browse products</p></div>`).join("")}</div>`;
    case "section": return `<div style="background:${c.bgColor ?? "transparent"};padding:${c.padding ?? "40"}px 0;min-height:60px"></div>`;
    default: return "";
  }
}

function renderContentBody(body: string): string {
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    if (parsed.elements && Array.isArray(parsed.elements)) {
      return `<div style="max-width:1200px;margin:0 auto;padding:20px">${parsed.elements.map(renderBuilderElement).join("")}</div>`;
    }
  } catch { /* not JSON, render as plain HTML */ }
  return body;
}

// ── CONTENT PAGES ──
  for (const entry of contentEntries) {
    pages.push({
      slug: String(entry.slug),
      title: String(entry.title),
      description: String(entry.excerpt ?? "").slice(0, 160),
      content: `<div class="page-content" style="background:white;border-radius:4px;overflow:hidden"><h1 style="font-size:1.8rem;margin:0 0 20px;padding:32px 32px 0">${e(entry.title)}</h1><div style="padding:0 32px 32px">${renderContentBody(String(entry.body))}</div></div>`,
    });
  }
  if (!pages.some((p) => p.slug === "about")) pages.push({ slug: "about", title: "About", description: "About us", content: `<div class="page-content"><h1>About ${e(siteName)}</h1><p>Your trusted online store built with Extora Studio.</p></div>` });

  // ── 404 PAGE ──
  pages.push({
    slug: "404", title: "Page Not Found", description: "404",
    content: `<div class="page-content" style="text-align:center;padding:80px 20px">
<h1 style="font-size:4rem;color:#ccc;margin-bottom:8px">404</h1>
<h2 style="font-size:1.5rem;margin-bottom:12px">Page Not Found</h2>
<p style="color:#565959;margin-bottom:24px">The page you're looking for doesn't exist or has been moved.</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
<a href="/index.html" class="btn-cart" style="text-decoration:none;display:inline-block;padding:10px 24px">Go to Homepage</a>
<a href="/products.html" style="color:#007185;text-decoration:none;padding:10px 24px">Browse Products</a>
<a href="/search.html" style="color:#007185;text-decoration:none;padding:10px 24px">Search</a>
</div>
</div>`,
  });

  // ── MAINTENANCE PAGE (when enabled) ──

  // ── SEARCH RESULTS PAGE ──
  const productJson = JSON.stringify(products.map((p: any) => ({
    id: String(p.id ?? ""), name: String(p.name ?? ""), price: Number(p.price ?? 0),
    mrp: p.mrp ? Number(p.mrp) : null, slug: String(p.slug ?? ""),
    category: String(p.category ?? ""), brand: String(p.brand ?? ""),
    rating: Number(p.rating ?? 0), reviews: Number(p.reviews ?? 0),
    img: Array.isArray(p.images) && p.images.length > 0 ? String(p.images[0]) : "",
    deal: p.dealType ? String(p.dealLabel ?? p.dealType) : null,
  })));

  pages.push({
    slug: "search", title: "Search Products", description: "Find products",
    content: `<div class="page-content">
<h1>Search Products</h1>
<div style="margin-bottom:20px;display:flex;gap:8px">
<input type="text" id="searchInput" placeholder="Search by name, category, brand..." style="flex:1;padding:12px 16px;border:1px solid #ddd;border-radius:8px;font-size:1rem;outline:none" onkeyup="doSearch()" />
<button onclick="doSearch()" style="padding:12px 24px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-weight:600;cursor:pointer;white-space:nowrap">Search</button>
</div>
<div id="searchResults" class="products-grid"></div>
<p id="noResults" style="display:none;text-align:center;padding:40px;color:#565959">No products found. Try a different search term.</p>
</div>
<script>
const ALL_PRODUCTS = ${productJson};
const params = new URLSearchParams(window.location.search);
const q = params.get("q");
if (q) { document.getElementById("searchInput").value = q; }

function doSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const container = document.getElementById("searchResults");
  const noRes = document.getElementById("noResults");
  if (!query) { container.innerHTML = ""; noRes.style.display = "none"; return; }

  const matches = ALL_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    container.innerHTML = "";
    noRes.style.display = "block";
  } else {
    noRes.style.display = "none";
    container.innerHTML = matches.map(p => {
      const mrp = p.mrp && p.mrp > p.price ? '<span class="mrp" style="font-size:.8rem;color:#565959;text-decoration:line-through">₹' + p.mrp.toLocaleString("en-IN") + '</span>' : '';
      const discount = p.mrp && p.mrp > p.price ? '<span class="badge">-' + Math.round((1-p.price/p.mrp)*100) + '%</span>' : '';
      return '<div class="product-card"><a href="/product-' + p.slug + '.html" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%">' +
      (p.img ? '<div class="img-wrap"><img src="' + p.img + '" alt="" loading="lazy"></div>' : '<div class="img-wrap"><span style="color:#999">No Image</span></div>') +
      '<span class="pname">' + p.name + '</span>' +
      (p.rating > 0 ? '<span class="stars">' + "★".repeat(Math.floor(p.rating)) + '</span>' : '') +
      '<div class="pr"><span class="p">₹' + p.price.toLocaleString("en-IN") + '</span>' + mrp + '</div>' +
      discount + (p.deal ? '<span class="badge" style="background:#c45500">' + p.deal + '</span>' : '') +
      '<span class="stock-ok" style="display:flex;align-items:center">In Stock<button class="btn-cart" style="margin-left:auto;padding:5px 10px;background:#ffd814;border:1px solid #fcd200;border-radius:12px;font-size:.7rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="' + p.name.replace(/"/g,'&quot;') + '" data-price="' + p.price + '" onclick="addToCart(this);return false">Add</button></span></a></div>';
    }).join("");
  }
}
doSearch();
</script>`,
  });

  // ── CUSTOMER ACCOUNT PAGE ──
  pages.push({
    slug: "account", title: "My Account", description: "Sign in or create an account",
    content: `<div class="page-content" style="max-width:500px;margin:40px auto">
<div style="display:flex;gap:0;margin-bottom:24px">
<button id="tabLogin" onclick="showTab('login')" style="flex:1;padding:12px;background:#ffd814;border:1px solid #fcd200;font-weight:600;cursor:pointer;border-radius:8px 0 0 8px">Sign In</button>
<button id="tabRegister" onclick="showTab('register')" style="flex:1;padding:12px;background:white;border:1px solid #ddd;cursor:pointer;border-radius:0 8px 8px 0">Register</button>
</div>

<div id="loginForm">
<h2 style="margin-bottom:16px">Sign In</h2>
<input type="email" id="loginEmail" placeholder="Email" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:4px;margin-bottom:8px;font-size:1rem">
<input type="password" id="loginPass" placeholder="Password" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:4px;margin-bottom:12px;font-size:1rem">
<button onclick="doLogin()" style="width:100%;padding:12px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer">Sign In</button>
<p id="loginMsg" style="color:#cc0c39;margin-top:8px;font-size:.85rem"></p>
</div>

<div id="registerForm" style="display:none">
<h2 style="margin-bottom:16px">Create Account</h2>
<input type="text" id="regName" placeholder="Full Name" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:4px;margin-bottom:8px;font-size:1rem">
<input type="email" id="regEmail" placeholder="Email" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:4px;margin-bottom:8px;font-size:1rem">
<input type="password" id="regPass" placeholder="Password (min 8 chars)" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:4px;margin-bottom:12px;font-size:1rem">
<button onclick="doRegister()" style="width:100%;padding:12px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer">Create Account</button>
<p id="regMsg" style="color:#007600;margin-top:8px;font-size:.85rem"></p>
</div>

<div id="accountInfo" style="display:none">
<h2 style="margin-bottom:4px">Welcome, <span id="accName"></span>!</h2>
<p style="color:#565959;margin-bottom:20px" id="accEmail"></p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
<div style="background:#f8f8f8;border-radius:8px;padding:16px">
<h4 style="margin-bottom:8px">Profile</h4>
<p style="color:#565959;font-size:.85rem" id="accRole"></p>
</div>
<div style="background:#f8f8f8;border-radius:8px;padding:16px">
<h4 style="margin-bottom:8px">Recent Orders</h4>
<div id="accOrders" style="font-size:.85rem;color:#565959">Loading...</div>
</div>
</div>
<div style="margin-top:20px;display:flex;gap:10px">
<button onclick="doLogout()" style="padding:8px 20px;background:white;border:1px solid #ddd;border-radius:8px;cursor:pointer">Sign Out</button>
<a href="/orders.html" style="padding:8px 20px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;text-decoration:none;color:#0f1111;font-weight:600;display:inline-block">View All Orders</a>
</div>
</div>

<script>
const API = "/api/v1/auth";
function showTab(t) {
  document.getElementById("tabLogin").style.background = t==="login" ? "#ffd814" : "white";
  document.getElementById("tabRegister").style.background = t==="register" ? "#ffd814" : "white";
  document.getElementById("loginForm").style.display = t==="login" ? "block" : "none";
  document.getElementById("registerForm").style.display = t==="register" ? "block" : "none";
}
function checkSession() {
  const token = localStorage.getItem("at");
  if (token) {
    fetch(API + "/session", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json()).then(d => {
        if (d.user) {
          document.getElementById("loginForm").style.display = "none";
          document.getElementById("registerForm").style.display = "none";
          document.getElementById("accountInfo").style.display = "block";
          document.getElementById("accName").textContent = d.user.displayName;
          document.getElementById("accEmail").textContent = d.user.email;
          document.getElementById("accRole").textContent = "Role: " + (d.user.role || "Customer");
          // Fetch recent orders
          fetch("/api/v1/commerce/orders", { headers: { Authorization: "Bearer " + token } })
            .then(r => r.json()).then(od => {
              const orders = od.data || [];
              const el = document.getElementById("accOrders");
              if (orders.length === 0) { el.innerHTML = "No orders yet"; return; }
              el.innerHTML = orders.slice(0,3).map(o => '<div style="padding:4px 0;border-bottom:1px solid #e7e7e7"><strong>' + o.orderNumber + '</strong> — ₹' + (o.total||0).toLocaleString("en-IN") + ' <span style="color:#007600;font-size:.8rem">' + o.status + '</span></div>').join("");
            }).catch(() => {});
        }
      }).catch(() => {});
  }
}
async function doLogin() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;
  try {
    const r = await fetch(API + "/login", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({email, password: pass}) });
    const d = await r.json();
    if (d.accessToken) { localStorage.setItem("at", d.accessToken); location.reload(); }
    else document.getElementById("loginMsg").textContent = d.message || "Login failed";
  } catch { document.getElementById("loginMsg").textContent = "Network error"; }
}
async function doRegister() {
  const displayName = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPass").value;
  if (password.length < 8) { document.getElementById("regMsg").textContent = "Password must be 8+ characters"; return; }
  try {
    const r = await fetch(API + "/register", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({displayName, email, password}) });
    const d = await r.json();
    if (d.accessToken) { localStorage.setItem("at", d.accessToken); location.reload(); }
    else document.getElementById("regMsg").textContent = d.message || "Registration failed";
  } catch { document.getElementById("regMsg").textContent = "Network error"; }
}
function doLogout() { localStorage.removeItem("at"); location.reload(); }
checkSession();
</script>
</div>`,
  });

  // ── CUSTOMER ORDERS PAGE ──
  pages.push({
    slug: "orders", title: "My Orders", description: "View your order history",
    content: `<div class="page-content">
<h1>My Orders</h1>
<div id="ordersList"><p style="color:#565959">Sign in to view your orders.</p></div>
<script>
const token = localStorage.getItem("at");
if (token) {
  fetch("/api/v1/commerce/orders", { headers: { Authorization: "Bearer " + token } })
    .then(r => r.json()).then(d => {
      const orders = d.data || [];
      if (orders.length === 0) {
        document.getElementById("ordersList").innerHTML = '<p style="color:#565959;text-align:center;padding:40px">No orders yet. <a href="/index.html" style="color:#007185">Start shopping</a></p>';
        return;
      }
      document.getElementById("ordersList").innerHTML = '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f0f2f2"><th style="text-align:left;padding:10px">Order</th><th style="text-align:left">Date</th><th style="text-align:right">Total</th><th style="text-align:center">Status</th></tr></thead><tbody>' +
      orders.map(o => '<tr style="border-bottom:1px solid #e7e7e7"><td style="padding:10px"><strong>' + o.orderNumber + '</strong></td><td style="padding:10px;color:#565959">' + new Date(o.createdAt).toLocaleDateString() + '</td><td style="padding:10px;text-align:right;font-weight:600">₹' + (o.total||0).toLocaleString("en-IN") + '</td><td style="padding:10px;text-align:center"><span style="background:#007600;color:white;padding:2px 8px;border-radius:4px;font-size:.8rem;text-transform:capitalize">' + (o.status||'confirmed') + '</span></td></tr>').join("") +
      '</tbody></table>';
    }).catch(() => {});
}
</script>
</div>`,
  });

  // ── WISHLIST PAGE ──
  pages.push({
    slug: "wishlist", title: "My Wishlist", description: "Saved products",
    content: `<div class="page-content">
<h1>My Wishlist</h1>
<div id="wishlistContent"><p style="color:#565959">Loading wishlist...</p></div>
<script>
function renderWishlist() {
  var w = getWishlist();
  var el = document.getElementById("wishlistContent");
  if (w.length === 0) { el.innerHTML = '<p style="color:#565959;text-align:center;padding:40px">Your wishlist is empty. <a href="/index.html" style="color:#007185">Start browsing</a></p>'; return; }
  el.innerHTML = w.map(function(i, idx) {
    return '<div style="display:flex;align-items:center;gap:16px;padding:16px;border-bottom:1px solid #e7e7e7">' +
      '<span style="flex:1;font-size:1rem;color:#0f1111">' + i.name + '</span>' +
      '<a href="/product-' + i.slug + '.html" style="background:#ffd814;border:1px solid #fcd200;padding:8px 20px;border-radius:20px;text-decoration:none;color:#0f1111;font-weight:600;font-size:.85rem">View</a>' +
      '<button onclick="removeWish(' + idx + ');renderWishlist()" style="background:none;border:1px solid #ddd;color:#cc0c39;padding:6px 14px;border-radius:4px;cursor:pointer">Remove</button>' +
      '</div>';
  }).join("");
}
renderWishlist();
</script>
</div>`,
  });

  // ── PRODUCT COMPARISON PAGE ──
  pages.push({
    slug: "compare", title: "Compare Products", description: "Side by side comparison",
    content: `<div class="page-content">
<h1>Compare Products</h1>
<div id="compareContent"><p style="color:#565959;text-align:center;padding:40px">Select 2-3 products using the ☐ checkbox on product cards, then click Compare Now.</p></div>
<script>
function renderCompare() {
  var c = getCompare();
  var el = document.getElementById("compareContent");
  if (c.length < 2) { el.innerHTML = '<p style="color:#565959;text-align:center;padding:40px">Select at least 2 products to compare. <a href="/index.html" style="color:#007185">Browse products</a></p>'; return; }
  var rows = [
    {label:"Image", values:c.map(function(i){return i.img ? '<img src="'+i.img+'" class="ct-img" alt="">' : '—'})},
    {label:"Name", values:c.map(function(i){return i.name})},
    {label:"Price", values:c.map(function(i){return '<span class="ct-price">₹'+Number(i.price||0).toLocaleString("en-IN")+'</span>'})},
    {label:"Category", values:c.map(function(i){return i.category||'—'})},
    {label:"Brand", values:c.map(function(i){return i.brand||'—'})},
    {label:"Rating", values:c.map(function(i){var r=Number(i.rating||0);return r>0?'★'.repeat(Math.floor(r))+'☆'.repeat(5-Math.floor(r))+' '+r.toFixed(1)+' ('+i.reviews+')':'—'})},
    {label:"Action", values:c.map(function(i){return '<a href="/product-'+i.slug+'.html" style="background:#ffd814;border:1px solid #fcd200;padding:8px 20px;border-radius:20px;text-decoration:none;color:#0f1111;font-weight:600;font-size:.85rem;display:inline-block">View</a>'})}
  ];
  var html = '<table class="compare-table"><thead><tr><th></th>' + c.map(function(){return '<th></th>'}).join("") + '</tr></thead><tbody>';
  rows.forEach(function(row) {
    html += '<tr><td>'+row.label+'</td>' + row.values.map(function(v){return '<td>'+v+'</td>'}).join("") + '</tr>';
  });
  html += '</tbody></table>';
  html += '<div style="margin-top:16px;text-align:center"><button onclick="clearCompare();location.reload()" style="padding:8px 20px;background:rgba(255,255,255,.15);border:1px solid #ddd;border-radius:4px;cursor:pointer;font-size:.85rem">Clear & Start Over</button></div>';
  el.innerHTML = html;
}
renderCompare();
</script>
</div>`,
  });

  // ── WRITE FILES ──
  const allProducts = products.map((p: any) => ({
    name: String(p.name ?? ""), slug: String(p.slug ?? ""),
    category: String(p.category ?? ""), price: Number(p.price ?? 0),
  }));
  let totalSize = 0;
  for (const page of pages) {
    const html = layout(site, page.content, page.title, allProducts);
    const fileName = page.slug === "index" ? "index.html" : `${page.slug}.html`;
    await writeFile(join(outputDir, fileName), html, "utf-8");
    totalSize += Buffer.byteLength(html, "utf-8");
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((p) => `<url><loc>http://localhost/${p.slug === "index" ? "" : p.slug + ".html"}</loc></url>`).join("")}</urlset>`;
  await writeFile(join(outputDir, "sitemap.xml"), sitemap, "utf-8");
  await writeFile(join(outputDir, "robots.txt"), "User-agent: *\nAllow: /\n", "utf-8");
  totalSize += Buffer.byteLength(sitemap, "utf-8") + 30;
  await prisma.auditLog.create({ data: { action: "site.publish", resource: "site", outcome: "success", details: { pages: pages.length, sizeKB: Math.round(totalSize / 1024) } as any } });
  const result: PublishedSite = { id: `pub_${Date.now()}`, url: "http://localhost/published", pages: pages.length, sizeKB: Math.round(totalSize / 1024), publishedAt: new Date().toISOString() };
  logger.info(`Published: ${pages.length} pages, ${result.sizeKB} KB`);
  return result;
}
