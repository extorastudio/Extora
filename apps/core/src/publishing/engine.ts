/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string */
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

function layout(site: { name: string }, body: string, pageTitle: string): string {
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
<div class="search"><input placeholder="Search..."><button>Go</button></div>
<div class="nav-r"><a href="#">Account</a><a href="#">Orders</a><a href="#" style="font-weight:700">Cart</a></div>
</div></div>
<nav class="sub-nav"><div class="inner">
<a href="/index.html">All</a><a href="/products.html">Best Sellers</a><a href="/deals.html">Today's Deals</a><a href="/about.html">About</a></div></nav>
</header>
<main>${body}</main>
<footer><div class="inner">
<div><h4>Get to Know Us</h4><a href="/about.html">About</a></div>
<div><h4>Connect</h4><a href="#">Facebook</a><a href="#">Twitter</a><a href="#">Instagram</a></div>
<div><h4>Make Money</h4><a href="#">Sell</a><a href="#">Affiliate</a></div>
<div><h4>Help</h4><a href="#">Customer Service</a><a href="#">Returns</a></div>
<div class="bt">&copy; 2026 ${e(site.name)}. Published with Extora.</div>
</div></footer>
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
<div class="img-wrap">${img ? `<img src="${e(img)}" alt="" loading="lazy">` : "No Image"}</div>
<span class="pname">${e(p.name)}</span>
${rating > 0 ? `<span class="stars">${stars(rating)}</span>` : ""}
<div class="pr"><span class="p">${rupee(price)}</span>${mrp && mrp > price ? `<span class="mrp">${rupee(mrp)}</span>` : ""}</div>
${discount > 0 ? `<span class="badge">-${discount}%</span>` : ""}
${p.dealType ? `<span class="badge" style="background:#c45500">${e(p.dealLabel ?? p.dealType)}</span>` : ""}
<span class="stock-ok">In Stock</span>
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
  hpSections.push(`<div class="section-header"><h2>Featured Products</h2><a href="/products.html">See all</a></div><div class="products-grid">${products.slice(0, 12).map(productCard).join("")}</div>`);
  if (categories.length) hpSections.push(`<div class="section-header"><h2>Shop by Category</h2></div><div style="max-width:1500px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding:0 15px 20px">${categories.slice(0, 6).map((c: any) => `<div style="background:white;padding:20px;border-radius:4px"><h3>${e(c.name)}</h3><p style="color:#565959;font-size:.85rem">${e(c.description)}</p><a href="/category-${e(c.slug)}.html" style="color:#007185;font-size:.85rem;text-decoration:none">Shop now</a></div>`).join("")}</div>`);
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
<button class="btn-cart">Add to Cart</button>
<button class="btn-buy">Buy Now</button>
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

<div class="section-header"><h2>Frequently Bought Together</h2></div>
<div class="products-grid">${products.filter((_: any, i: number) => i < 4).map(productCard).join("")}</div>

<div class="section-header"><h2>Similar Products</h2></div>
<div class="products-grid">${products.filter((x: any) => x.id !== p.id).slice(0, 6).map(productCard).join("")}</div>
</div>`,
    });
  }

  // ── CATEGORY, DEALS, PRODUCTS LISTING ──
  for (const cat of categories) {
    const cp = products.filter((x: any) => String(x.category) === String(cat.name));
    pages.push({ slug: `category-${e(cat.slug)}`, title: String(cat.name), description: String(cat.description ?? ""), content: `<div class="section-header"><h2>${e(cat.name)}</h2></div>${cp.length ? `<div class="products-grid">${cp.map(productCard).join("")}</div>` : '<p style="text-align:center;padding:60px">No products</p>'}` });
  }
  if (deals.length) pages.push({ slug: "deals", title: "Today's Deals", description: "Limited time offers", content: `<div class="section-header"><h2>Today's Deals</h2></div><div class="products-grid">${deals.map(productCard).join("")}</div>` });
  pages.push({ slug: "products", title: "All Products", description: "Browse all", content: `<div class="section-header"><h2>All Products</h2></div><div class="products-grid">${products.map(productCard).join("")}</div>` });

  // ── CONTENT PAGES ──
  for (const entry of contentEntries) pages.push({ slug: String(entry.slug), title: String(entry.title), description: String(entry.excerpt ?? "").slice(0, 160), content: `<div class="page-content"><h1>${e(entry.title)}</h1>${String(entry.body)}</div>` });
  if (!pages.some((p) => p.slug === "about")) pages.push({ slug: "about", title: "About", description: "About us", content: `<div class="page-content"><h1>About ${e(siteName)}</h1><p>Your trusted online store built with Extora Studio.</p></div>` });

  // ── WRITE FILES ──
  let totalSize = 0;
  for (const page of pages) {
    const html = layout(site, page.content, page.title);
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
