import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import type { Logger } from "@extora/types";

interface PublishedSite {
  id: string;
  url: string;
  pages: number;
  sizeKB: number;
  publishedAt: string;
}

interface PageData {
  slug: string;
  title: string;
  content: string;
  description: string;
  tagline?: string;
}

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderPage(page: PageData, siteName: string): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(page.title)} — ${escapeHtml(siteName)}</title>
<meta name="description" content="${escapeHtml(page.description)}">
<meta name="generator" content="Extora">${page.tagline ? `\n<meta name="keywords" content="${escapeHtml(page.tagline)}">` : ""}
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1a1a2e;background:#f8f9fa}
.container{max-width:960px;margin:0 auto;padding:0 20px}
header{background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;padding:60px 0 40px}
header h1{font-size:2rem;margin-bottom:8px}
header p{opacity:0.8}
nav{background:white;border-bottom:1px solid #e2e8f0;padding:12px 0;position:sticky;top:0;z-index:10}
nav .container{display:flex;gap:24px}
nav a{color:#4a5568;text-decoration:none;font-weight:500}
nav a:hover{color:#1a1a2e}
main{padding:48px 0}
.content{max-width:720px;margin:0 auto}
.content h1,.content h2,.content h3{margin:24px 0 12px;line-height:1.3}
.content p{margin-bottom:16px;color:#4a5568}
.hero{text-align:center;padding:80px 0 60px}
.hero h1{font-size:3rem;margin-bottom:16px}
.hero p{font-size:1.2rem;max-width:600px;margin:0 auto;opacity:0.9}
.grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:24px}
.card{background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:24px}
.card h2{font-size:1.2rem;margin-bottom:8px}
.card p{color:#718096;font-size:0.95rem}
.btn{display:inline-block;padding:10px 20px;background:#1a1a2e;color:white;text-decoration:none;border-radius:6px;font-weight:500}
.btn:hover{background:#16213e}
footer{background:#1a1a2e;color:#a0aec0;padding:32px 0;text-align:center;font-size:0.9rem}
</style>
</head>
<body>
<header>
<div class="container">
<h1>${escapeHtml(siteName)}</h1>${page.tagline ? `\n<p>${escapeHtml(page.tagline)}</p>` : ""}
</div>
</header>
<nav>
<div class="container">
<a href="/">Home</a>
<a href="/about.html">About</a>
<a href="/blog.html">Blog</a>
<a href="/contact.html">Contact</a>
</div>
</nav>
<main>
<div class="content">${page.content}</div>
</main>
<footer>
<div class="container">&copy; ${String(year)} ${escapeHtml(siteName)}. Published with Extora.</div>
</footer>
</body>
</html>`;
}

export async function publishSite(
  prisma: PrismaClient,
  logger: Logger,
): Promise<PublishedSite> {
  const siteName = ((await prisma.systemConfig.findUnique({
    where: { key: "site_name" },
  }))?.value as string) || "My Extora Site";

  const outputDir = process.env.PUBLISH_DIR ?? join(process.cwd(), "published");
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const pages: PageData[] = [];

  // Fetch products for homepage/shop
  const products = await prisma.product.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  // Homepage — shows products if available
  if (products.length > 0) {
    const productCards = products
      .map((p) => {
        const imgTag = Array.isArray(p.images) && (p.images as string[]).length > 0
          ? `<img src="${escapeHtml(String((p.images as string[])[0]))}" alt="${escapeHtml(p.name)}" class="product-img" loading="lazy">`
          : `<div class="product-img" style="display:flex;align-items:center;justify-content:center;color:#999;background:#f7f7f7">No Image</div>`;
        return `<div class="product-card">
${imgTag}
<a href="/product-${escapeHtml(p.slug)}.html" style="text-decoration:none;color:inherit"><span class="product-name">${escapeHtml(p.name)}</span></a>
<span class="product-rating">★ ${String(p.rating)}</span>
<span class="product-reviews">${String(p.reviews)} ratings</span>
<div class="price-row"><span class="price">$${p.price.toFixed(2)}</span>${p.comparePrice ? `<span class="compare-price">$${p.comparePrice.toFixed(2)}</span>` : ""}</div>
${p.inStock ? `<p style="color:#007600;font-size:0.8rem;margin-top:4px">In Stock</p>` : `<p style="color:#cc0c39;font-size:0.8rem;margin-top:4px">Out of Stock</p>`}
${p.inStock ? `<button class="btn-add">Add to Cart</button>` : ""}
</div>`;
      })
      .join("\n");

    pages.push({
      slug: "index",
      title: `${siteName} — Shop`,
      description: `Shop products at ${siteName}`,
      tagline: "Built with Extora — the plugin ecosystem platform",
      content: `<div class="hero-banner" style="background:linear-gradient(135deg,#232f3e,#131921);padding:40px 0 60px;text-align:center;color:white">
<h1 style="font-size:2.5rem;margin-bottom:8px">${escapeHtml(siteName)}</h1>
<p style="font-size:1.1rem;opacity:0.9;max-width:600px;margin:0 auto">Discover amazing products at great prices</p>
</div>
<div class="section-header"><h2>Featured Products</h2><a href="/products.html">See all</a></div>
<div class="container"><div class="products-grid">${productCards}</div></div>`,
    });

    // Product detail pages
    for (const product of products) {
      pages.push({
        slug: `product-${product.slug}`,
        title: product.name,
        description: product.description.slice(0, 160),
        content: `<div class="container">
<div class="product-detail" style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin:20px auto;max-width:1200px;background:white;border-radius:4px;padding:24px">
<div class="product-gallery">${Array.isArray(product.images) && (product.images as string[]).length > 0 ? (product.images as string[]).map((img: string) => `<img src="${escapeHtml(img)}" alt="${escapeHtml(product.name)}" style="width:100%;max-height:400px;object-fit:contain;background:#f7f7f7;border-radius:4px" loading="lazy">`).join("\n") : `<div style="width:100%;height:400px;background:#f7f7f7;display:flex;align-items:center;justify-content:center;color:#999">No Image</div>`}</div>
<div>
<h1 style="font-size:1.5rem;margin-bottom:8px">${escapeHtml(product.name)}</h1>
<span style="color:#febd69;font-size:1.1rem">★ ${String(product.rating)}</span>
<span style="color:#007185;margin-left:8px">${String(product.reviews)} ratings</span>
<div style="margin:12px 0"><span style="font-size:1.8rem;color:#b12704;font-weight:600">$${product.price.toFixed(2)}</span>${product.comparePrice ? ` <span style="text-decoration:line-through;color:#565959">$${product.comparePrice.toFixed(2)}</span>` : ""}</div>
<p style="color:#0f1111;line-height:1.6;margin:16px 0">${escapeHtml(product.description)}</p>
<p style="color:#565959;font-size:0.9rem">Category: <strong>${escapeHtml(product.category)}</strong></p>
<p style="color:#565959;font-size:0.9rem">SKU: ${escapeHtml(product.sku)}</p>
${product.inStock ? `<button style="margin-top:16px;padding:12px 32px;background:#ffd814;border:1px solid #fcd200;border-radius:20px;font-size:1rem;font-weight:500;cursor:pointer">Add to Cart</button>` : `<p style="margin-top:12px;color:#cc0c39;font-weight:600">Currently unavailable</p>`}
</div>
</div></div>`,
      });
    }
  } else {
    // No products — show default homepage
    pages.push({
      slug: "index",
      title: `Welcome to ${siteName}`,
      description: `Welcome to ${siteName} — powered by Extora`,
      tagline: "Built with Extora — the plugin ecosystem platform",
      content: `<div class="hero">
<h1>Welcome to ${escapeHtml(siteName)}</h1>
<p>Your website is live! Add products and content via the admin panel.</p>
<div style="margin-top:32px">
<a href="/admin-panel/" class="btn">Go to Admin Panel</a>
</div>
</div>
<div class="grid2">
<div class="card"><h2>Products</h2><p>Add products from the admin panel to populate your store.</p></div>
<div class="card"><h2>Content</h2><p>Create pages and blog posts using the CMS.</p></div>
<div class="card"><h2>Plugins</h2><p>6 official plugins ready to extend your site.</p></div>
<div class="card"><h2>Themes</h2><p>Customize your site look with themes.</p></div>
</div>`,
    });
  }

  let totalSize = 0;

  for (const page of pages) {
    const html = renderPage(page, siteName);
    const fileName = page.slug === "index" ? "index.html" : `${page.slug}.html`;
    const filePath = join(outputDir, fileName);
    await writeFile(filePath, html, "utf-8");
    totalSize += Buffer.byteLength(html, "utf-8");
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map((p) => `<url><loc>http://localhost/${p.slug === "index" ? "" : p.slug + ".html"}</loc></url>`).join("\n  ")}
</urlset>`;
  await writeFile(join(outputDir, "sitemap.xml"), sitemapXml, "utf-8");
  totalSize += Buffer.byteLength(sitemapXml, "utf-8");

  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: http://localhost/sitemap.xml\n\n# Published by Extora`;
  await writeFile(join(outputDir, "robots.txt"), robotsTxt, "utf-8");
  totalSize += Buffer.byteLength(robotsTxt, "utf-8");

  await prisma.auditLog.create({
    data: {
      action: "site.publish",
      resource: "site",
      outcome: "success",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      details: { pages: pages.length, sizeKB: Math.round(totalSize / 1024) } as any,
    },
  });

  const publishedSite: PublishedSite = {
    id: `pub_${String(Date.now())}`,
    url: process.env.SITE_URL ?? "http://localhost/published",
    pages: pages.length,
    sizeKB: Math.round(totalSize / 1024),
    publishedAt: new Date().toISOString(),
  };

  logger.info(`Site published: ${String(pages.length)} pages, ${String(publishedSite.sizeKB)} KB`);

  return publishedSite;
}
