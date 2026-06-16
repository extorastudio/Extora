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

  const pages: PageData[] = [
    {
      slug: "index",
      title: `Welcome to ${siteName}`,
      description: `Welcome to ${siteName} — powered by Extora`,
      tagline: "Built with Extora — the plugin ecosystem platform",
      content: `<div class="hero">
<h1>Welcome to ${escapeHtml(siteName)}</h1>
<p>Your website is live! Add content via the CMS plugin to customize this page.</p>
<div style="margin-top:32px">
<a href="/api/v1/system/health" class="btn">API Health</a>
</div>
</div>
<div class="grid2">
<div class="card"><h2>Plugins</h2><p>6 official plugins: Auth, CMS, Commerce, Forms, SEO, Analytics</p></div>
<div class="card"><h2>Themes</h2><p>2 official themes: Admin, Default</p></div>
<div class="card"><h2>CMS</h2><p>Content types, entries, media, taxonomies</p></div>
<div class="card"><h2>Commerce</h2><p>Products, orders, cart, checkout</p></div>
</div>`,
    },
    {
      slug: "about",
      title: "About",
      description: "About Extora Studio",
      content: `<div class="container"><h1>About</h1><p>This website is powered by <strong>Extora Studio</strong>, the TypeScript-first plugin ecosystem platform.</p><p>Extora is the operating system for web software — build anything with plugins.</p><div style="margin-top:24px"><a href="https://github.com/extorastudio/Extora" class="btn">View on GitHub</a></div></div>`,
    },
    {
      slug: "contact",
      title: "Contact",
      description: "Get in touch",
      content: `<div class="container"><h1>Contact</h1><p>Get in touch with us.</p><p>Email: hello@extora.dev</p></div>`,
    },
    {
      slug: "blog",
      title: "Blog",
      description: "Extora Blog",
      content: `<div class="container"><h1>Blog</h1><div class="grid2"><div class="card"><h2>Getting Started with Extora</h2><p>Learn how to install and configure your Extora site.</p><p><em>Coming soon</em></p></div><div class="card"><h2>Building Extora Plugins</h2><p>A guide to creating your first Extora plugin.</p><p><em>Coming soon</em></p></div><div class="card"><h2>Theme Development</h2><p>How to build and publish Extora themes.</p><p><em>Coming soon</em></p></div></div></div>`,
    },
  ];

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
