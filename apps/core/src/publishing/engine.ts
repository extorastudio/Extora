/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import type { Logger } from "@extora/types";

interface PublishedSite { id: string; url: string; pages: number; sizeKB: number; publishedAt: string; }
interface PageData { slug: string; title: string; description: string; tagline?: string; content: string; }

const e = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function layout(site: { name: string; tagline: string }, body: string, pageTitle: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${e(pageTitle)} — ${e(site.name)}</title>
<meta name="description" content="${e(site.tagline)}"><meta name="generator" content="Extora">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;color:#0f1111;background:#eaeded;line-height:1.5}
.top-nav{background:#131921;color:white;font-size:14px}
.top-nav .inner{max-width:1500px;margin:0 auto;display:flex;align-items:center;gap:16px;padding:12px 15px;flex-wrap:wrap}
.top-nav .logo{font-size:1.4rem;font-weight:700;color:#febd69;text-decoration:none;white-space:nowrap}
.top-nav .logo span{color:white;font-weight:400}
.top-nav .search{flex:1;min-width:200px;display:flex;height:40px}
.top-nav .search input{flex:1;padding:0 12px;border:none;border-radius:4px 0 0 4px;font-size:.95rem;outline:none}
.top-nav .search button{background:#febd69;border:none;padding:0 16px;border-radius:0 4px 4px 0;cursor:pointer;font-weight:600}
.top-nav .nav-r{display:flex;gap:18px;align-items:center;white-space:nowrap}
.top-nav .nav-r a{color:white;text-decoration:none;font-size:.85rem}
.sub-nav{background:#232f3e;padding:0}
.sub-nav .inner{max-width:1500px;margin:0 auto;display:flex;gap:4px;padding:6px 15px;overflow-x:auto}
.sub-nav a{color:white;text-decoration:none;font-size:.85rem;white-space:nowrap;padding:4px 10px;border-radius:2px}
.sub-nav a:hover{outline:1px solid white}
.hero{background:linear-gradient(180deg,#3a5a8c 0%,#131921 400px,#eaeded 400px);padding:30px 0 60px}
.hero .inner{max-width:1500px;margin:0 auto;padding:0 15px}
.hero h1{font-size:2rem;color:white;margin-bottom:6px}
.hero p{font-size:1.1rem;color:rgba(255,255,255,.9);max-width:600px}
.section-header{max-width:1500px;margin:0 auto;display:flex;align-items:baseline;gap:12px;padding:16px 15px 8px}
.section-header h2{font-size:1.3rem;color:#0f1111}
.section-header a{font-size:.85rem;color:#007185;text-decoration:none}
.section-header a:hover{color:#c7511f;text-decoration:underline}
.products-grid{max-width:1500px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:0;padding:0 15px}
.product-card{background:white;border:1px solid #f0f0f0;padding:16px;display:flex;flex-direction:column;transition:box-shadow .15s}
.product-card:hover{box-shadow:0 2px 12px rgba(0,0,0,.1)}
.product-card .img-wrap{width:100%;height:200px;display:flex;align-items:center;justify-content:center;background:#f7f7f7;margin-bottom:8px}
.product-card .img-wrap img{max-width:100%;max-height:100%;object-fit:contain}
.product-card .pname{font-size:.9rem;color:#0f1111;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-decoration:none}
.product-card a{text-decoration:none;color:inherit}
.product-card .stars{color:#febd69;font-size:.8rem;margin-bottom:2px}
.product-card .price-row{display:flex;align-items:baseline;gap:6px;margin:6px 0}
.product-card .price{font-size:1.1rem;font-weight:600;color:#b12704}
.product-card .old-price{font-size:.8rem;color:#565959;text-decoration:line-through}
.product-card .badge{display:inline-block;background:#cc0c39;color:white;font-size:.7rem;padding:2px 6px;border-radius:2px;margin-bottom:6px}
.product-card .btn-cart{display:block;width:100%;padding:7px;text-align:center;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-size:.8rem;font-weight:500;cursor:pointer;margin-top:auto;color:#0f1111}
.pdetail{max-width:1200px;margin:20px auto;display:grid;grid-template-columns:1fr 1fr;gap:32px;background:white;border-radius:4px;padding:28px}
.pdetail .gallery{display:flex;flex-direction:column;gap:8px}
.pdetail .gallery img{width:100%;max-height:420px;object-fit:contain;background:#f7f7f7;border-radius:4px}
.pdetail h1{font-size:1.5rem;margin-bottom:8px}
.pdetail .stars{color:#febd69;font-size:.95rem;margin:8px 0}
.pdetail .price{font-size:1.8rem;color:#b12704;font-weight:600;margin:12px 0}
.pdetail .desc{color:#0f1111;line-height:1.7;margin:16px 0}
.pdetail .add-cart{padding:12px 48px;background:#ffd814;border:1px solid #fcd200;border-radius:20px;font-size:1rem;cursor:pointer}
.cat-grid{max-width:1500px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding:20px 15px}
.cat-card{background:white;padding:20px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.cat-card h3{font-size:1rem;margin-bottom:6px}
.page-content{max-width:900px;margin:20px auto;background:white;border-radius:4px;padding:32px}
footer{background:#232f3e;color:white;margin-top:40px;padding:40px 15px 20px}
footer .inner{max-width:1200px;margin:0 auto}
footer .fcols{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;margin-bottom:24px}
footer h4{font-size:.95rem;margin-bottom:8px}
footer a{display:block;color:#ddd;text-decoration:none;font-size:.82rem;padding:2px 0}
footer .bottom{text-align:center;color:#999;font-size:.78rem;padding-top:16px;border-top:1px solid #3a4553}
@media(max-width:768px){.pdetail{grid-template-columns:1fr;padding:16px}.products-grid{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}}
@media(max-width:480px){.top-nav .search{order:3;width:100%}}
</style>
</head>
<body>
<header>
<div class="top-nav"><div class="inner">
<a href="/index.html" class="logo">extora<span>.shop</span></a>
<div class="search"><input type="text" placeholder="Search products..."><button>Go</button></div>
<div class="nav-r"><a href="/cart.html">&#128722; Cart</a></div>
</div></div>
<nav class="sub-nav"><div class="inner"><a href="/index.html">All</a><a href="/products.html">Products</a><a href="/deals.html">Deals</a><a href="/about.html">About</a><a href="/contact.html">Contact</a></div></nav>
</header>
<main>${body}</main>
<footer><div class="inner"><div class="fcols">
<div><h4>Get to Know Us</h4><a href="/about.html">About</a><a href="/blog.html">Blog</a></div>
<div><h4>Make Money</h4><a href="/sell.html">Sell</a><a href="/affiliate.html">Affiliate</a></div>
<div><h4>Payment</h4><a href="/gift.html">Gift Cards</a></div>
<div><h4>Help</h4><a href="/orders.html">Orders</a><a href="/returns.html">Returns</a></div>
</div>
<div class="bottom">&copy; ${new Date().getFullYear()} ${e(site.name)}. Extora.</div></div></footer>
</body></html>`;
}

function productCard(p: any): string {
  const img = Array.isArray(p.images) && p.images.length > 0 ? String(p.images[0]) : "";
  const price = Number(p.price ?? 0);
  const salePrice = p.salePrice ? Number(p.salePrice) : null;
  const deal = p.dealType ? String(p.dealLabel ?? p.dealType) : null;
  const savings = salePrice && price > 0 ? Math.round((1 - salePrice / price) * 100) : 0;
  const rating = Number(p.rating ?? 0);

  return `<div class="product-card">
<div class="img-wrap">${img ? `<img src="${e(img)}" alt="${e(String(p.name))}" loading="lazy">` : `<span style="color:#999">No Image</span>`}</div>
<a href="/product-${e(String(p.slug))}.html"><span class="pname">${e(String(p.name))}</span></a>
${rating > 0 ? `<span class="stars">${"★".repeat(Math.floor(rating))}${"☆".repeat(5 - Math.floor(rating))}</span>` : ""}
<div class="price-row">
<span class="price">$${salePrice ? salePrice.toFixed(2) : price.toFixed(2)}</span>
${salePrice && price > salePrice ? `<span class="old-price">$${price.toFixed(2)}</span>` : ""}
</div>
${savings > 0 ? `<span class="badge">-${savings}%</span>` : ""}
${deal ? `<span class="badge" style="background:#c45500">${e(deal)}</span>` : ""}
<button class="btn-cart">Add to Cart</button>
</div>`;
}

export async function publishSite(prisma: PrismaClient, logger: Logger): Promise<PublishedSite> {
  const siteName = String((await prisma.systemConfig.findUnique({ where: { key: "site_name" } }))?.value ?? "Extora Shop");
  const tagline = String((await prisma.systemConfig.findUnique({ where: { key: "site_tagline" } }))?.value ?? "Great products, great prices");

  const outputDir = process.env.PUBLISH_DIR ?? join(process.cwd(), "published");
  if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true });

  const pages: PageData[] = [];
  const products = await (prisma as any).product.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 50 });
  const categories = await (prisma as any).productCategory.findMany({ orderBy: { name: "asc" } });
  const deals = products.filter((p: any) => p.dealType);
  const contentEntries = await (prisma as any).contentEntry.findMany({ where: { status: "published" } });
  const site = { name: siteName, tagline };

  // HOMEPAGE
  const sections = [];
  if (deals.length > 0) sections.push(`<div class="section-header"><h2>Today's Deals</h2><a href="/deals.html">See all</a></div><div class="products-grid">${deals.slice(0, 6).map((p: any) => productCard(p)).join("")}</div>`);
  sections.push(`<div class="section-header"><h2>Featured Products</h2><a href="/products.html">See all</a></div><div class="products-grid">${products.slice(0, 12).map((p: any) => productCard(p)).join("")}</div>`);
  if (categories.length > 0) sections.push(`<div class="section-header"><h2>Shop by Category</h2></div><div class="cat-grid">${categories.slice(0, 6).map((c: any) => `<div class="cat-card"><h3>${e(String(c.name))}</h3><p style="color:#565959;font-size:.85rem">${String(c.description ?? "")}</p><a href="/category-${e(String(c.slug))}.html">Shop now</a></div>`).join("")}</div>`);

  pages.push({ slug: "index", title: siteName, description: tagline, content: `<div class="hero"><div class="inner"><h1>${e(siteName)}</h1><p>${e(tagline)}</p></div></div>${sections.join("")}` });

  // PRODUCT DETAIL + CATEGORY + DEALS + LISTING PAGES
  for (const p of products) {
    const imgs: string[] = Array.isArray(p.images) ? p.images.map(String) : [];
    const price = Number(p.price ?? 0); const sp = p.salePrice ? Number(p.salePrice) : null;
    pages.push({
      slug: `product-${String(p.slug)}`, title: String(p.name), description: String(p.shortDesc ?? "").slice(0, 160),
      content: `<div class="pdetail">
<div class="gallery">${imgs.length > 0 ? imgs.map((i: string) => `<img src="${e(i)}" alt="${e(String(p.name))}">`).join("") : `<div style="height:400px;background:#f7f7f7;display:flex;align-items:center;justify-content:center;color:#999">No Image</div>`}</div>
<div><h1>${e(String(p.name))}</h1>${Number(p.rating) > 0 ? `<div class="stars">${"★".repeat(Math.floor(Number(p.rating)))} (${p.reviews})</div>` : ""}
<div class="price">$${sp ? sp.toFixed(2) : price.toFixed(2)}${sp && price > sp ? ` <span class="old-price">$${price.toFixed(2)}</span>` : ""}</div>
<div class="desc">${String(p.description)}</div>
<p style="color:#565959">Category: ${e(String(p.category))} | SKU: ${e(String(p.sku))} | Brand: ${e(String(p.brand))}</p>
${p.dealType ? `<p style="color:#c45500;font-weight:600">${e(String(p.dealLabel ?? p.dealType))}!</p>` : ""}
<button class="add-cart">Add to Cart</button></div></div>`,
    });
  }

  for (const cat of categories) {
    const cp = products.filter((p: any) => String(p.category) === String(cat.name));
    pages.push({ slug: `category-${String(cat.slug)}`, title: String(cat.name), description: String(cat.description ?? ""), content: `<div class="section-header"><h2>${e(String(cat.name))}</h2></div>${cp.length > 0 ? `<div class="products-grid">${cp.map((p: any) => productCard(p)).join("")}</div>` : `<div style="text-align:center;padding:60px"><h3>No products</h3></div>`}` });
  }

  if (deals.length > 0) pages.push({ slug: "deals", title: "Today's Deals", description: "Limited time offers", content: `<div class="section-header"><h2>Today's Deals</h2></div><div class="products-grid">${deals.map((p: any) => productCard(p)).join("")}</div>` });
  pages.push({ slug: "products", title: "All Products", description: "Browse all", content: `<div class="section-header"><h2>All Products</h2></div><div class="products-grid">${products.map((p: any) => productCard(p)).join("")}</div>` });

  for (const entry of contentEntries) pages.push({ slug: String(entry.slug), title: String(entry.title), description: String(entry.excerpt ?? "").slice(0, 160), content: `<div class="page-content"><h1>${e(String(entry.title))}</h1>${String(entry.body)}</div>` });

  if (!pages.some((p) => p.slug === "about")) pages.push({ slug: "about", title: "About", description: "About us", content: `<div class="page-content"><h1>About ${e(siteName)}</h1><p>Your one-stop shop built with Extora Studio.</p><a href="/products.html" class="btn-cart" style="display:inline-block;text-decoration:none">Shop Now</a></div>` });
  if (!pages.some((p) => p.slug === "contact")) pages.push({ slug: "contact", title: "Contact", description: "Get in touch", content: `<div class="page-content"><h1>Contact Us</h1><p>Email: hello@extora.dev</p></div>` });

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
  logger.info(`Site published: ${pages.length} pages, ${result.sizeKB} KB`);
  return result;
}
