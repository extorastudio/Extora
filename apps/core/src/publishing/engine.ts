/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkdir, writeFile, readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import type { Logger } from "@extora/types";

interface PublishedSite { id: string; url: string; pages: number; sizeKB: number; publishedAt: string; }
interface PageData { slug: string; title: string; description: string; content: string; }

const e = (s: any) => String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const sjs = (s: any) => String(s ?? "").replace(/-/g, "_").replace(/[^a-zA-Z0-9_$]/g, "");
const stars = (n: number) => "★".repeat(Math.floor(n)) + "☆".repeat(5 - Math.floor(n));
const rupee = (n: number) => "₹" + n.toLocaleString("en-IN");

function layout(site: { name: string }, body: string, pageTitle: string, allProducts?: any[], pluginState?: { commerce: boolean; cms: boolean; auth: boolean; seo: boolean; recs: boolean; cod: boolean; razorpay: boolean }, seoMeta?: { title?: string; description?: string; keywords?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; noIndex?: boolean }, themeSettings?: Record<string, any>): string {
  const s = themeSettings ?? {};
  const primaryColor = String(s.primaryColor ?? "#131921");
  const accentColor  = String(s.accentColor ?? "#febd69");
  const bgColor      = String(s.bgColor ?? "#eaeded");
  const textColor    = String(s.textColor ?? "#0f1111");
  const linkColor    = String(s.linkColor ?? "#007185");
  const footerBg     = String(s.footerBg ?? "#232f3e");
  const bodyFont     = String(s.bodyFont ?? "Arial, Helvetica, sans-serif");
  const customCss    = String(s.customCss ?? "");
  const customJs     = String(s.customJs ?? "");
  const productJson = allProducts ? JSON.stringify(allProducts) : "[]";
  const cs = pluginState?.commerce ?? true;
  const cms = pluginState?.cms ?? true;
  const authActive = pluginState?.auth ?? true;
  const seoActive = pluginState?.seo ?? true;
  const recsActive = pluginState?.recs ?? true;
  const codAvailable = pluginState?.cod ?? true;
  const razorpayActive = pluginState?.razorpay ?? false;
  const seo = seoActive && seoMeta ? seoMeta : {};
  const seoTitle = seo.title || pageTitle;
  const seoDesc = seo.description || "";
  const seoKeywords = seo.keywords || "";
  const metaExtra = seoDesc ? `<meta name="description" content="${e(seoDesc)}">` + (seoKeywords ? `<meta name="keywords" content="${e(seoKeywords)}">` : "") : "";
  const ogExtra = seo.ogTitle ? `<meta property="og:title" content="${e(seo.ogTitle || "")}"><meta property="og:description" content="${e(seo.ogDescription || "")}">${seo.ogImage ? `<meta property="og:image" content="${e(seo.ogImage)}">` : ""}` : "";
  const robotsContent = seo.noIndex ? "noindex, nofollow" : "index, follow";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="robots" content="${robotsContent}"><title>${e(seoTitle)} — ${e(site.name)}</title><meta name="generator" content="Extora">${metaExtra}${ogExtra}<style>
*{box-sizing:border-box;margin:0;padding:0}
.announce-bar{background:#232f3e;color:white;text-align:center;padding:8px 16px;font-size:.82rem;position:relative;display:flex;align-items:center;justify-content:center;gap:12px}
.announce-bar .announce-close{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;font-size:1.1rem;padding:2px 6px}
.announce-bar .announce-close:hover{color:white}
.announce-bar a{color:#febd69;text-decoration:underline}
.save-tag{display:inline-block;background:#cc0c39;color:white;font-size:.7rem;padding:2px 6px;border-radius:3px;font-weight:600;vertical-align:middle;margin-left:6px}
body{font-family:Arial,Helvetica,sans-serif;color:#0f1111;background:#eaeded;line-height:1.5}
.top-nav{background:#131921;color:white;font-size:14px}
.top-nav .inner{max-width:1500px;margin:0 auto;display:flex;align-items:center;gap:16px;padding:10px 15px}
.top-nav .logo{font-size:1.4rem;font-weight:700;color:#febd69;text-decoration:none}
.top-nav .search{flex:1;display:flex;height:40px}
.top-nav .search input{flex:1;padding:0 12px;border:none;border-radius:4px 0 0 4px;font-size:.95rem}
.top-nav .search button{background:#febd69;border:none;padding:0 16px;border-radius:0 4px 4px 0;font-weight:600;cursor:pointer}
.search-wrap{position:relative;flex:1}
.search-wrap input{width:100%;height:40px;padding:0 12px;border:none;border-radius:4px 0 0 4px;font-size:.95rem;box-sizing:border-box}
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
.pdetail .gallery{display:flex;flex-direction:column;gap:8px;position:relative}
.pdetail .gallery .main-wrap{position:relative;cursor:zoom-in;background:white;border-radius:4px;border:1px solid #e7e7e7}
.pdetail .gallery .main-img{width:100%;aspect-ratio:1;object-fit:contain;display:block;transition:opacity .2s}
.pdetail .gallery .zoom-lens{position:absolute;border:2px solid #555;width:120px;height:120px;display:none;pointer-events:none;z-index:10;background:rgba(255,255,255,.2)}
.pdetail .gallery .zoom-result{position:absolute;top:0;left:calc(100% + 16px);width:400px;height:400px;background-repeat:no-repeat;z-index:20;display:none;border:1px solid #e7e7e7;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,.15)}
.pdetail .gallery .gallery-nav{position:absolute;top:50%;transform:translateY(-50%);background:white;border:1px solid #ddd;border-radius:4px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;font-size:1.2rem;color:#555;box-shadow:0 1px 4px rgba(0,0,0,.1);opacity:0;transition:opacity .2s}
.pdetail .gallery:hover .gallery-nav{opacity:1}
.pdetail .gallery .gallery-nav.prev{left:8px}
.pdetail .gallery .gallery-nav.next{right:8px}
.pdetail .gallery .thumbs{display:flex;gap:6px;flex-wrap:wrap}
.pdetail .gallery .thumbs img{width:50px;height:50px;object-fit:contain;border:1px solid #e7e7e7;border-radius:2px;cursor:pointer;transition:border-color .15s}
.pdetail .gallery .thumbs img:hover{border-color:#febd69}
.pdetail .gallery .thumbs img.active{border-color:#e77600;box-shadow:0 0 0 2px #e77600}
.pdetail .gallery .thumbs .thumb-video{position:relative;cursor:pointer}
.pdetail .gallery .thumbs .thumb-video::after{content:'▶';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;background:rgba(0,0,0,.6);border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:.6rem}
.pdetail .gallery .video-wrap{width:100%;aspect-ratio:16/9;background:black;display:none;border-radius:4px;overflow:hidden}
.pdetail .gallery .video-wrap video,.pdetail .gallery .video-wrap iframe{width:100%;height:100%;border:none}
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
.stock-no{color:#cc0c39;font-size:.75rem;font-weight:600}
.stock-low{color:#c45500;font-size:.75rem;font-weight:600}

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
.back-to-top{position:fixed;bottom:24px;right:24px;width:44px;height:44px;background:#232f3e;color:white;border:none;border-radius:50%;font-size:1.3rem;cursor:pointer;z-index:998;display:none;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.3);transition:opacity .3s}
.back-to-top:hover{background:#37475a}
.deal-timer{display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#cc0c39,#b12704);color:white;padding:8px 16px;border-radius:8px;font-size:.9rem;font-weight:600}
.deal-timer .time-box{background:white;color:#cc0c39;padding:2px 8px;border-radius:4px;font-weight:700;font-size:1rem;min-width:32px;text-align:center}
.helpful-vote{display:inline-flex;align-items:center;gap:16px;margin-top:4px}
.helpful-vote button{background:none;border:1px solid #ddd;padding:3px 10px;border-radius:4px;cursor:pointer;font-size:.75rem;color:#565959}
.helpful-vote button:hover{background:#f0f2f2;color:#0f1111}
.helpful-vote button.voted{background:#f0f2f2;border-color:#007185;color:#007185;font-weight:600}
.related-search{display:inline-block;margin:4px;padding:6px 14px;background:#f0f2f2;border:1px solid #ddd;border-radius:20px;font-size:.8rem;color:#0f1111;cursor:pointer;text-decoration:none}
.related-search:hover{background:#e3e6e6}
@keyframes shimmer{0%{background-position:-200px 0}100%{background-position:calc(200px + 100%) 0}}
.skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200px 100%;animation:shimmer 1.5s ease-in-out infinite;border-radius:4px}
.skeleton-card{background:white;border:1px solid #f0f0f0;padding:16px;display:flex;flex-direction:column;gap:10px}
.skeleton-card .sk-img{height:180px}
.skeleton-card .sk-line{height:14px;width:80%}
.skeleton-card .sk-line.short{width:50%}
.skeleton-card .sk-line.price{width:40%;height:18px}
.skeleton-card .sk-btn{height:28px;width:90px;border-radius:14px;align-self:flex-end}
.filter-sidebar{background:white;border:1px solid #e7e7e7;border-radius:8px;padding:16px}
.filter-sidebar h4{font-size:.95rem;margin:0 0 12px;color:#0f1111}
.filter-sidebar label{display:flex;align-items:center;gap:6px;padding:4px 0;font-size:.85rem;color:#0f1111;cursor:pointer}
.filter-sidebar input[type=checkbox]{accent-color:#ffd814}
.filter-sidebar .filter-count{color:#565959;font-size:.8rem;margin-left:auto}

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
.cart-drawer-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:999;display:none}
.cart-drawer{position:fixed;top:0;right:-420px;width:400px;height:100%;background:white;z-index:1000;transition:right .3s ease;display:flex;flex-direction:column;overflow:hidden}
.cart-drawer.open{right:0}
.cart-drawer-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e7e7e7;background:#f0f2f2;flex-shrink:0}
.cart-drawer-header h3{margin:0;font-size:1.1rem}
.cart-drawer-header button{background:none;border:none;font-size:1.4rem;cursor:pointer;color:#565959;padding:4px 8px;line-height:1}
.cart-drawer-body{flex:1;overflow-y:auto;padding:16px 20px}
.cart-drawer-footer{border-top:1px solid #e7e7e7;padding:16px 20px;background:#fafafa;flex-shrink:0}
.cart-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #e7e7e7;align-items:flex-start}
.cart-item-img{width:80px;height:80px;object-fit:cover;border-radius:4px;border:1px solid #e7e7e7;flex-shrink:0;background:#f0f2f2}
.cart-item-info{flex:1;min-width:0}
.cart-item-info .name{font-size:.9rem;color:#0f1111;margin:0 0 4px;word-break:break-word}
.cart-item-info .price{font-size:.85rem;color:#b12704;font-weight:600}
.cart-qty{display:flex;align-items:center;gap:6px;margin-top:6px}
.cart-qty button{width:28px;height:28px;border:1px solid #ddd;border-radius:4px;background:white;cursor:pointer;font-size:1rem;line-height:1;display:flex;align-items:center;justify-content:center;color:#333}
.cart-qty button:hover{background:#f0f2f2}
.cart-qty span{min-width:24px;text-align:center;font-size:.9rem}
.cart-item-remove{color:#cc0c39;font-size:.75rem;cursor:pointer;background:none;border:none;padding:2px 0;margin-top:4px}
.cart-item-remove:hover{text-decoration:underline}
@media(max-width:768px){
.pdetail{grid-template-columns:1fr}
.pdetail .gallery .zoom-result{display:none!important}
.pdetail .gallery .zoom-lens{display:none!important}
.page-content{flex-direction:column!important;padding:16px!important}
.filter-sidebar{max-width:100%!important;min-width:auto!important}
.products-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
.top-nav .nav-r{gap:8px;font-size:.8rem}
.top-nav .nav-r a:nth-child(n+3){display:none}
.top-nav .search{flex:2}
.compare-bar{flex-direction:column;gap:8px}
.compare-bar .cb-items{flex-wrap:wrap}
footer .inner{grid-template-columns:repeat(2,1fr)}
.products-grid .product-card .pname{font-size:.8rem}
}
@media(max-width:480px){
.products-grid{grid-template-columns:repeat(2,1fr);gap:1px}
.product-card .img-wrap{height:140px}
.top-nav .inner{flex-wrap:wrap;gap:8px}
.top-nav .search{order:3;flex-basis:100%}
.top-nav .logo{order:1}
.top-nav .nav-r{order:2}
.top-nav .search input{font-size:.85rem;height:36px}
.top-nav .search-wrap input{height:36px;font-size:.85rem}
.pdetail h1{font-size:1.2rem}
.pdetail .price-row .price{font-size:1.4rem}
.page-content{padding:12px!important}
.product-card{padding:8px!important}
.product-card a{padding:8px!important}
.product-card .btn-cart{padding:4px 8px!important;font-size:.65rem!important}
.wishlist-btn{width:26px;height:26px;font-size:.8rem}
.compare-check{font-size:.9rem}
.back-to-top{width:36px;height:36px;bottom:16px;right:12px}
}
<style>
/* Theme Overrides */
body{font-family:${bodyFont};color:${textColor};background:${bgColor}}
.top-nav{background:${primaryColor}}
.top-nav .logo{color:${accentColor}}
.sub-nav{background:${footerBg}}
footer{background:${footerBg}}
a{color:${linkColor}}
.top-nav .search button{background:${accentColor}}
.announce-bar{background:${footerBg}}
.announce-bar a{color:${accentColor}}
.pdetail .rating-row .stars{color:${accentColor}}
.pdetail .rating-row .revs{color:${linkColor}}
.pdetail .gallery .thumbs img:hover{border-color:${accentColor}}
${customCss ? "/* Custom CSS */\n" + customCss + "\n" : ""}
</style></head><body>
<div class="announce-bar" id="announceBar">
<span>🚀 Free shipping on orders above ₹499 | <a href="/deals.html">Today's Deals</a> — Up to 60% off</span>
<button class="announce-close" onclick="document.getElementById('announceBar').style.display='none';sessionStorage.setItem('extora_announce','closed')" title="Close">✕</button>
</div>
<header><div class="top-nav"><div class="inner">
<a href="/index.html" class="logo">extora<span style="color:white">.in</span></a>
<div class="search"><div class="search-wrap"><input id="navSearch" placeholder="Search..." autocomplete="off" onkeyup="navSuggest(event)" onfocus="navSuggest(event)" onblur="setTimeout(()=>{const s=document.getElementById('navSuggestions');if(s)s.style.display='none'},200)"><div id="navSuggestions" class="search-suggestions"></div></div><button onclick="navGo()">Go</button></div>
<div class="nav-r" style="position:relative">
<a href="/account.html" id="headerAccount">Sign In</a>
<div id="accountDropdown" style="display:none;position:absolute;top:100%;right:0;background:white;border:1px solid #ddd;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.15);min-width:180px;z-index:100;padding:8px 0">
<a href="/account.html" style="display:block;padding:8px 16px;color:#0f1111;text-decoration:none;font-size:.85rem">My Account</a>
<a href="/orders.html" style="display:block;padding:8px 16px;color:#0f1111;text-decoration:none;font-size:.85rem">My Orders</a>
<a href="/track-order.html" style="display:block;padding:8px 16px;color:#0f1111;text-decoration:none;font-size:.85rem">Track Order</a>
<hr style="margin:4px 0;border:none;border-top:1px solid #e7e7e7">
<a href="#" onclick="doHeaderLogout();return false" style="display:block;padding:8px 16px;color:#cc0c39;text-decoration:none;font-size:.85rem">Sign Out</a>
</div>
<a href="/orders.html">Orders</a>
<a href="#" style="font-weight:700" onclick="showWishlist();return false">Wishlist <span id="wishCount"></span></a>
<a href="#" style="font-weight:700;text-decoration:none;color:white;position:relative" onclick="showCart();return false"><span style="font-size:1.3rem;line-height:1">🛒</span><span id="cartCount" style="position:absolute;top:-6px;right:-12px;background:#febd69;color:#0f1111;font-size:.65rem;min-width:18px;height:18px;border-radius:9px;display:none;align-items:center;justify-content:center;font-weight:700;padding:0 4px;line-height:1"></span></a>
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
<div><h4>Let Us Help</h4><a href="/account.html">Your Account</a><a href="/orders.html">Your Orders</a><a href="/track-order.html">Track Order</a><a href="#">Returns</a><a href="#">Help</a></div>
<div style="grid-column:1/-1;margin-top:12px;padding:16px 0;border-top:1px solid #3a4553;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
<span style="color:white;font-size:.9rem">Subscribe to our newsletter</span>
<input type="email" id="nlEmail" placeholder="Enter your email" style="flex:1;min-width:200px;padding:8px 12px;border:1px solid #3a4553;border-radius:4px;background:#131921;color:white;font-size:.85rem">
<button onclick="subscribeNewsletter()" style="padding:8px 20px;background:#febd69;border:none;border-radius:4px;font-weight:600;cursor:pointer;font-size:.85rem">Subscribe</button>
<span id="nlMsg" style="color:#4caf50;font-size:.8rem"></span>
</div>
<div class="bt">&copy; 2026 ${e(site.name)}. Published with Extora.</div>
</div></footer>
<div class="cart-drawer-overlay" id="cartOverlay" onclick="closeCartDrawer()"></div>
<div class="cart-drawer" id="cartDrawer">
<div class="cart-drawer-header"><h3><span id="drawerCartTitle">Shopping Cart</span></h3><button onclick="closeCartDrawer()">×</button></div>
<div class="cart-drawer-body" id="drawerBody"></div>
<div class="cart-drawer-footer" id="drawerFooter"><p style="text-align:center;color:#565959">Your cart is empty</p></div>
</div>
<script>
var COMMERCE_ACTIVE = ${cs};
var CMS_ACTIVE = ${cms};
var AUTH_ACTIVE = ${authActive};
var SEO_ACTIVE = ${seoActive};
var RECS_ACTIVE = ${recsActive};
var COD_AVAILABLE = ${codAvailable};
var RAZORPAY_AVAILABLE = ${razorpayActive};
if (!COMMERCE_ACTIVE) {
  document.querySelectorAll(".nav-r a").forEach(function(a) {
    if (a.textContent.includes("Wishlist") || a.textContent.includes("Cart") || a.href.includes("orders.html")) a.style.display = "none";
  });
}
if (!AUTH_ACTIVE) {
  var accEl = document.getElementById("headerAccount");
  if (accEl) accEl.innerHTML = "Account";
  document.querySelectorAll(".nav-r a").forEach(function(a) {
    if (a.href.includes("account.html") || a.href.includes("orders.html")) a.style.display = "none";
  });
}
function getCart() { try { return JSON.parse(localStorage.getItem("extora_cart") || "[]"); } catch { return []; } }
function saveCart(c) { localStorage.setItem("extora_cart", JSON.stringify(c)); updateCartCount(); }
function updateCartCount() { var c = getCart(); var count = c.reduce(function(s,i){return s + i.qty;},0); var el = document.getElementById("cartCount"); if (el) { if (count > 0) { el.textContent = count; el.style.display = "flex"; } else { el.textContent = ""; el.style.display = "none"; } } }
function addToCart(el) {
  console.log("[Extora] addToCart called", el.getAttribute("data-name"));
  try {
    const name = el.getAttribute("data-name") || "Product";
    const price = parseFloat(el.getAttribute("data-price") || "0");
    const img = el.getAttribute("data-img") || "";
    const slug = el.getAttribute("data-slug") || "";
    const cart = getCart();
    const existing = cart.find(function(i){ return i.name === name; });
    if (existing) existing.qty++; else cart.push({ name: name, price: price, qty: 1, img: img, slug: slug });
    saveCart(cart);
    el.textContent = "✓"; el.style.background = "#007600"; el.style.color = "white"; el.style.borderColor = "#007600";
    setTimeout(function(){ el.textContent = "Add to Cart"; el.style.background = ""; el.style.color = ""; el.style.borderColor = ""; }, 2000);
    var token = localStorage.getItem("at");
    if (token) fetch("/api/v1/commerce/cart/add", { method:"POST", headers:{"Content-Type":"application/json", Authorization:"Bearer "+token}, body: JSON.stringify({productId: name, name: name, price: price, qty: 1}) }).catch(function(){});
    console.log("[Extora] opening cart drawer, cart size:", cart.length);
    openCartDrawer();
  } catch(e) { console.error("[Extora] addToCart error:", e); }
  return false;
}
function buyNow(el) {
  addToCart(el);
  setTimeout(() => showCart(), 300);
}
function updateMultiBuy(slug, price, qty) {
  var msg = document.getElementById("multiBuyMsg-" + slug);
  if (!msg) return;
  var n = parseInt(qty) || 1;
  if (n >= 5) { msg.textContent = "Save 15% — Pay ₹" + (price * n * 0.85).toLocaleString("en-IN") + " (₹" + Math.round(price * 0.85).toLocaleString("en-IN") + " each)"; }
  else if (n >= 3) { msg.textContent = "Save 10% — Pay ₹" + (price * n * 0.9).toLocaleString("en-IN") + " (₹" + Math.round(price * 0.9).toLocaleString("en-IN") + " each)"; }
  else if (n >= 2) { msg.textContent = "Save 5% — Pay ₹" + (price * n * 0.95).toLocaleString("en-IN") + " (₹" + Math.round(price * 0.95).toLocaleString("en-IN") + " each)"; }
  else { msg.textContent = ""; }
}
function removeFromCart(idx) { var c = getCart(); c.splice(idx,1); saveCart(c); syncCartToServer(); openCartDrawer(); }
function changeCartQty(idx, delta) {
  var c = getCart();
  if (idx < 0 || idx >= c.length) return;
  c[idx].qty += delta;
  if (c[idx].qty <= 0) { c.splice(idx, 1); }
  saveCart(c);
  syncCartToServer();
  openCartDrawer();
}
function syncCartToServer() {
  var token = localStorage.getItem("at");
  if (!token) return;
  var cart = getCart();
  fetch("/api/v1/commerce/cart/sync", { method:"POST", headers:{"Content-Type":"application/json", Authorization:"Bearer "+token}, body: JSON.stringify({items:cart}) }).catch(function(){});
}
function closeCartDrawer() { document.getElementById("cartOverlay").style.display = "none"; document.getElementById("cartDrawer").classList.remove("open"); }
function openCartDrawer() {
  console.log("[Extora] openCartDrawer called");
  try {
    var cart = getCart();
    var body = document.getElementById("drawerBody");
    var footer = document.getElementById("drawerFooter");
    var overlay = document.getElementById("cartOverlay");
    var drawer = document.getElementById("cartDrawer");
    var title = document.getElementById("drawerCartTitle");
    console.log("[Extora] drawer elements:", {body:!!body, footer:!!footer, overlay:!!overlay, drawer:!!drawer});
    if (!body || !footer || !overlay || !drawer) { console.error("[Extora] Missing drawer elements"); return; }
  if (cart.length === 0) {
    body.innerHTML = '<div style="text-align:center;padding:40px 0"><p style="color:#565959;margin:12px 0">Your cart is empty</p><a href="/products.html" style="color:#007185;text-decoration:none;font-weight:600">Browse Products</a></div>';
    footer.innerHTML = '<p style="text-align:center;color:#565959">Your cart is empty</p>';
  } else {
    var total = cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0);
    var couponDiscount = (typeof appliedCoupon !== "undefined" && appliedCoupon ? appliedCoupon.discount : 0);
    var finalTotal = total - couponDiscount;
    title.textContent = "Shopping Cart (" + cart.reduce(function(s,i){return s+i.qty;},0) + " items)";
    body.innerHTML = cart.map(function(item, idx){
      var imgTag = item.img ? '<img src="'+item.img+'" class="cart-item-img" onerror="this.style.display=\\'none\\'">' : '<div class="cart-item-img" style="background:#f0f2f2;display:flex;align-items:center;justify-content:center;color:#999;font-size:.7rem">No Img</div>';
      var subtotal = item.price * item.qty;
      return '<div class="cart-item">'+imgTag+'<div class="cart-item-info"><p class="name">'+item.name+'</p><p class="price">₹'+item.price.toLocaleString("en-IN")+'</p><div class="cart-qty"><button onclick="changeCartQty('+idx+',-1)">−</button><span>'+item.qty+'</span><button onclick="changeCartQty('+idx+',1)">+</button><span style="font-size:.8rem;color:#565959;margin-left:8px">₹'+subtotal.toLocaleString("en-IN")+'</span></div><button class="cart-item-remove" onclick="removeFromCart('+idx+')">Remove</button></div></div>';
    }).join("");
    var couponLine = couponDiscount > 0 && appliedCoupon ? '<div style="font-size:.8rem;color:#007600;margin-bottom:8px">Coupon ('+appliedCoupon.code+'): -₹'+couponDiscount.toLocaleString("en-IN")+'</div>' : '';
    var couponInput = '<div style="display:flex;gap:6px;margin-bottom:12px"><input type="text" id="drawerCouponCode" placeholder="Coupon code" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:.8rem"><button onclick="applyCouponDrawer()" style="padding:8px 14px;background:#ffd814;border:1px solid #fcd200;border-radius:4px;font-weight:600;cursor:pointer;font-size:.8rem;white-space:nowrap">Apply</button></div><span id="drawerCouponMsg" style="font-size:.75rem;color:#007600"></span>';
    footer.innerHTML = couponInput+couponLine+'<div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:.95rem"><span>Subtotal:</span><span style="font-weight:700">₹'+finalTotal.toLocaleString("en-IN")+'</span></div><a href="/cart.html" onclick="closeCartDrawer()" style="display:block;text-align:center;padding:12px;background:#ffd814;border:1px solid #fcd200;border-radius:24px;text-decoration:none;color:#0f1111;font-weight:600;font-size:.9rem;margin-bottom:8px">View Cart</a><button onclick="checkout()" style="width:100%;padding:12px;background:#ffa41c;border:1px solid #ff8f00;border-radius:24px;cursor:pointer;font-weight:600;font-size:.9rem">Proceed to Checkout</button>';
  }
  overlay.style.display = "block";
  drawer.classList.add("open");
  console.log("[Extora] drawer opened successfully");
  } catch(e) { console.error("[Extora] openCartDrawer error:", e); }
}
function applyCouponDrawer() {
  var code = document.getElementById("drawerCouponCode").value.trim();
  var msg = document.getElementById("drawerCouponMsg");
  if (!code) return;
  var cart = getCart();
  var total = cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0);
  fetch("/api/v1/coupons/validate", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({code:code, orderTotal:total}) })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (d.valid) { appliedCoupon = d; msg.textContent = d.message; msg.style.color = "#007600"; openCartDrawer(); }
      else { msg.textContent = d.message || "Invalid coupon"; msg.style.color = "#cc0c39"; }
    });
}
var appliedCoupon = null;
function applyCoupon() {
  var code = document.getElementById("couponCode") ? document.getElementById("couponCode").value.trim() : "";
  var msg = document.getElementById("couponMsg");
  if (!code || !msg) return;
  var cart = getCart();
  var total = cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0);
  fetch("/api/v1/coupons/validate", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({code:code, orderTotal:total}) })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (d.valid) { appliedCoupon = d; msg.textContent = d.message; msg.style.color = "#007600"; showCart(); }
      else { msg.textContent = d.message || "Invalid coupon"; msg.style.color = "#cc0c39"; appliedCoupon = null; }
    }).catch(function(){ msg.textContent = "Error validating coupon"; msg.style.color = "#cc0c39"; });
}
function showCart() {
  closeCartDrawer();
  var cart = getCart();
  if (cart.length === 0) {
    var recs = (typeof ALL_PRODUCTS !== "undefined" && typeof RECS_ACTIVE !== "undefined" && RECS_ACTIVE ? ALL_PRODUCTS.slice(0,4) : []).map(function(p){return '<div class="product-card"><a href="/product-'+p.slug+'.html" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><span class="pname">'+p.name+'</span><span class="stock-ok">₹'+p.price.toLocaleString("en-IN")+'</span></a></div>'}).join("");
    document.querySelector("main").innerHTML = '<div style="max-width:800px;margin:20px auto;background:white;border-radius:8px;padding:24px;text-align:center"><h2>Your Cart is Empty</h2><p style="color:#565959;margin:12px 0">Browse our trending products</p><a href="/products.html" style="display:inline-block;padding:12px 32px;background:#ffd814;border:1px solid #fcd200;border-radius:24px;text-decoration:none;color:#0f1111;font-weight:600;margin-bottom:20px">Shop Now</a>'+(recs?'<div class="section-header"><h2>Trending</h2></div><div class="products-grid">'+recs+'</div>':'')+'</div>';
    return;
  }
  var total = cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0);
  var couponDiscount = (typeof appliedCoupon !== "undefined" && appliedCoupon ? appliedCoupon.discount : 0);
  var finalTotal = total - couponDiscount;
  var items = cart.map(function(i, idx){
    var imgTag = i.img ? '<img src="'+i.img+'" style="width:100px;height:100px;object-fit:contain;border-radius:4px;border:1px solid #e7e7e7;flex-shrink:0" onerror="this.style.display=\\'none\\'">' : '<div style="width:100px;height:100px;border-radius:4px;background:#f0f2f2;display:flex;align-items:center;justify-content:center;color:#999;font-size:.7rem;border:1px solid #e7e7e7;flex-shrink:0">No Img</div>';
    var lineTotal = i.price * i.qty;
    return '<div style="display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid #e7e7e7">'+imgTag+'<div style="flex:1;min-width:0"><div style="font-size:.95rem;font-weight:600;color:#0f1111;margin-bottom:6px">'+i.name+'</div><span style="font-size:.85rem;color:#b12704;font-weight:600">₹'+i.price.toLocaleString("en-IN")+'</span><div class="cart-qty" style="margin-top:6px"><button onclick="changeCartQtyInline('+idx+',-1)" style="width:28px;height:28px;border:1px solid #ddd;border-radius:50%;background:white;cursor:pointer;font-size:1rem;line-height:1;color:#333">−</button><span style="min-width:32px;text-align:center;font-size:.9rem;font-weight:600">'+i.qty+'</span><button onclick="changeCartQtyInline('+idx+',1)" style="width:28px;height:28px;border:1px solid #ddd;border-radius:50%;background:white;cursor:pointer;font-size:1rem;line-height:1;color:#333">+</button></div></div><div style="text-align:right;flex-shrink:0"><div style="font-weight:700;font-size:1rem">₹'+lineTotal.toLocaleString("en-IN")+'</div><button onclick="removeFromCartInline('+idx+')" style="margin-top:6px;background:none;border:none;color:#cc0c39;cursor:pointer;font-size:.8rem">Remove</button></div></div>';
  }).join("");
  var couponRow = couponDiscount > 0 ? '<div style="color:#007600;font-size:.8rem;margin-bottom:4px">Coupon (' + appliedCoupon.code + '): -₹' + appliedCoupon.discount.toLocaleString("en-IN") + '</div>' : '';
  var couponInput = '<div style="margin-bottom:12px"><div style="display:flex;gap:6px"><input type="text" id="couponCode" placeholder="Enter coupon code" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:.8rem"><button onclick="applyCoupon()" style="padding:8px 14px;background:#ffd814;border:1px solid #fcd200;border-radius:4px;font-weight:600;cursor:pointer;font-size:.8rem;white-space:nowrap">Apply</button></div><span id="couponMsg" style="font-size:.75rem;color:#007600"></span></div>';
  var sidebarTotal = '<div style="background:white;border:1px solid #e7e7e7;border-radius:8px;padding:20px;position:sticky;top:80px"><h3 style="font-size:1.1rem;margin:0 0 4px">Subtotal ('+cart.reduce(function(s,i){return s+i.qty;},0)+' items):</h3><span style="font-size:1.4rem;font-weight:700">₹'+finalTotal.toLocaleString("en-IN")+'</span>'+couponRow+couponInput+'<div style="margin:8px 0"><span style="font-size:.75rem;color:#007600">✓ FREE delivery</span></div><button onclick="checkout()" style="width:100%;padding:12px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer;margin-bottom:8px">Proceed to Buy</button><button onclick="checkout()" style="width:100%;padding:12px;background:#ffa41c;border:1px solid #ff8f00;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer">Buy with EMI</button><p style="font-size:.7rem;color:#565959;margin:8px 0 0">By placing order, you agree to Extora\u2019s <a href="#" style="color:#007185">Privacy Notice</a> and <a href="#" style="color:#007185">Conditions of Use</a>.</p></div>';
  var recsSection = (typeof ALL_PRODUCTS !== "undefined" && typeof RECS_ACTIVE !== "undefined" && RECS_ACTIVE) ? '<div class="section-header" style="margin-top:32px;padding-left:0"><h2>Customers Also Bought</h2></div><div class="products-grid">'+ALL_PRODUCTS.slice(0,4).map(function(p){return '<div class="product-card"><a href="/product-'+p.slug+'.html" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><span class="pname">'+p.name+'</span><span class="stock-ok">₹'+p.price.toLocaleString("en-IN")+'</span></a></div>';}).join("")+'</div>' : '';
  document.querySelector("main").innerHTML = '<div style="max-width:1200px;margin:20px auto"><div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap"><div style="flex:1;min-width:300px;background:white;border-radius:8px;padding:24px"><h2 style="margin:0 0 16px;font-size:1.4rem">Shopping Cart</h2>'+items+'<div style="text-align:right;margin-top:12px;font-size:.85rem;font-weight:700">Subtotal ('+cart.reduce(function(s,i){return s+i.qty;},0)+' items): <span style="font-size:1.1rem">₹'+finalTotal.toLocaleString("en-IN")+'</span></div></div><div style="width:300px;flex-shrink:0;min-width:260px">'+sidebarTotal+'</div></div><a href="/index.html" style="display:inline-block;color:#007185;text-decoration:none;font-size:.9rem;margin-top:16px">← Continue Shopping</a></div>'+recsSection;
}
function changeCartQtyInline(idx, delta) { var c = getCart(); if (idx<0||idx>=c.length) return; c[idx].qty+=delta; if (c[idx].qty<=0) c.splice(idx,1); saveCart(c); showCart(); }
function removeFromCartInline(idx) { var c = getCart(); c.splice(idx,1); saveCart(c); showCart(); }
async function checkout() {
  var cart = getCart();
  if (cart.length === 0) { alert("Cart empty"); return; }
  var total = cart.reduce(function(s,i){return s + i.price * i.qty;},0);
  var token = localStorage.getItem("at");
  var email = "";
  // Try to get email from session if logged in
  if (token) {
    try {
      var sessionResp = await fetch("/api/v1/auth/session", { headers: { Authorization: "Bearer " + token } });
      var sessionData = await sessionResp.json();
      if (sessionData.user && sessionData.user.email) email = sessionData.user.email;
    } catch(e) {}
  }
  if (!email) email = prompt("Enter your email for order confirmation:");
  if (!email) return;

  // Payment method selection
  var paymentMethod = "cod";
  var codAvailable = typeof COD_AVAILABLE !== "undefined" ? COD_AVAILABLE : true;
  var razorpayAvailable = typeof RAZORPAY_AVAILABLE !== "undefined" ? RAZORPAY_AVAILABLE : false;
  var paymentOptions = [];
  if (codAvailable) paymentOptions.push("Cash on Delivery");
  if (razorpayAvailable) paymentOptions.push("Pay Online (Razorpay)");
  if (paymentOptions.length > 1) {
    var choice = prompt("Select payment method:\\n" + paymentOptions.map(function(o,i){ return (i+1) + ". " + o; }).join("\\n"));
    var idx = parseInt(choice) - 1;
    if (idx === 1 && razorpayAvailable) paymentMethod = "razorpay";
    else paymentMethod = "cod";
  }

  var isGift = confirm("Is this a gift order?");
  var giftMsg = "";
  if (isGift) giftMsg = prompt("Enter gift message (optional):") || "";

  // If Razorpay, redirect to payment page (handled by plugin)
  if (paymentMethod === "razorpay") {
    location.href = "/checkout.html?amount=" + total + "&email=" + encodeURIComponent(email) + "&token=" + encodeURIComponent(token || "");
    return;
  }

  // Proceed with COD checkout
  var orderNumber = "EXT-" + Date.now().toString().slice(-6);
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

  // Show suggestions from product data
  var recs = (typeof ALL_PRODUCTS !== "undefined" ? ALL_PRODUCTS : []).slice(0,4).map(function(p){return '<div class="product-card"><a href="/product-'+p.slug+'.html" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><span class="pname">'+p.name+'</span><span class="stock-ok">₹'+p.price.toLocaleString("en-IN")+'</span></a></div>'}).join("");
  var recHTML = recs ? '<div class="section-header" style="margin-top:32px"><h2>You Might Also Like</h2></div><div class="products-grid">'+recs+'</div>' : '';
  var couponDiscount = (typeof appliedCoupon !== "undefined" && appliedCoupon ? appliedCoupon.discount : 0);
  var finalTotal = total - couponDiscount;
  var couponLine = couponDiscount > 0 ? '<p style="color:#007600;font-size:.85rem">Coupon discount: -₹' + couponDiscount.toLocaleString("en-IN") + '</p>' : '';
  var giftBadge = giftMsg ? '<div style="margin:12px auto;max-width:400px;background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:12px;text-align:left"><span style="color:#f57f17;font-weight:600;font-size:.85rem">🎁 Gift Order</span><p style="color:#555;font-size:.85rem;margin:4px 0 0">Message: '+giftMsg+'</p></div>' : (isGift ? '<p style="color:#f57f17;font-size:.85rem">🎁 This is a gift order</p>' : '');
  document.querySelector("main").innerHTML = \`<div style="max-width:600px;margin:40px auto;text-align:center;background:white;border-radius:8px;padding:40px"><h2>Order Confirmed!</h2><p style="font-size:1.2rem;margin:16px 0">Order #\${orderNumber}</p><p>\${cart.length} items · ₹\${finalTotal.toLocaleString("en-IN")}</p>\${couponLine}\${giftBadge}<p style="color:#565959;margin-top:8px">Confirmation sent to \${email}</p><a href="/orders.html" style="display:inline-block;margin-top:16px;color:#007185;text-decoration:none">View Orders</a> · <a href="/orders.html" style="color:#007185;text-decoration:none;margin-left:12px">Track Order</a> · <a href="/index.html" style="color:#007185;text-decoration:none;margin-left:12px">Continue Shopping</a></div>\${recHTML}\`;
  localStorage.removeItem("extora_cart");
  updateCartCount();
}
// Note: cart buttons use inline onclick="addToCart(this);return false" — no global handler needed
document.addEventListener("DOMContentLoaded", function() {
  // Show announcement bar if not previously closed this session
  if (sessionStorage.getItem("extora_announce") === "closed") {
    var bar = document.getElementById("announceBar");
    if (bar) bar.style.display = "none";
  }
  updateCartCount();
  updateWishCount();
  updateVisibleHearts();
  updateCompareBar();
  updateCompareChecks();
  initVotes();
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
  // Delivery countdown timer — show "Order within Xh Ym to get by [Day]"
  (function(){
    var delEl = document.querySelector(".pdetail .delivery");
    if (!delEl) return;
    var cutoffHour = 16; // 4 PM cut-off
    var now = new Date();
    var hoursLeft = cutoffHour - now.getHours();
    var minsLeft = 60 - now.getMinutes();
    if (minsLeft === 60) { minsLeft = 0; hoursLeft++; }
    var estDay = "";
    if (hoursLeft > 0 || (hoursLeft === 0 && minsLeft > 0)) {
      estDay = "Tomorrow";
    } else {
      var d = new Date(now); d.setDate(d.getDate() + 2);
      estDay = d.toLocaleDateString("en-IN", { weekday: "long" });
    }
    if (estDay === "Sunday") estDay = "Monday";
    var cm = "";
    if (hoursLeft > 0) cm += hoursLeft + " hrs ";
    if (minsLeft > 0) cm += minsLeft + " mins";
    if (cm) {
      var span = document.createElement("div");
      span.style.cssText = "font-size:.82rem;color:#007600;margin-top:4px";
      span.textContent = "Order within " + cm.trim() + " to get it by " + estDay;
      delEl.parentNode.insertBefore(span, delEl.nextSibling);
      // Update every 60 seconds
      setInterval(function(){
        var n = new Date();
        var hl = cutoffHour - n.getHours();
        var ml = 60 - n.getMinutes();
        if (ml === 60) { ml = 0; hl++; }
        var txt = "Order within ";
        if (hl > 0) txt += hl + " hrs ";
        if (ml > 0) txt += ml + " mins";
        span.textContent = txt.trim() + " to get it by " + estDay;
      }, 60000);
    }
  })();
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
  // Show on product detail page
  const pdetail = document.querySelector(".pdetail");
  if (pdetail) {
    const container = document.createElement("div"); container.className = "section-header";
    container.innerHTML = '<h2>Recently Viewed</h2>';
    const grid = document.createElement("div"); grid.className = "products-grid";
    grid.innerHTML = viewed.slice(1, 5).map((v) => '<div class="product-card"><a href="' + v.url + '" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><span class="pname">' + v.name + '</span><span class="stock-ok">View Again</span></a></div>').join("");
    pdetail.parentElement?.appendChild(container); pdetail.parentElement?.appendChild(grid);
  } else {
    // Show on other pages (homepage, search, etc.) below main content
    const main = document.querySelector("main");
    if (main && !document.getElementById("globalRecentlyViewed")) {
      const wrapper = document.createElement("div"); wrapper.id = "globalRecentlyViewed";
      wrapper.style.cssText = "max-width:1500px;margin:20px auto;padding:0 15px";
      wrapper.innerHTML = '<div class="section-header"><h2>Recently Viewed</h2></div><div class="products-grid">' +
        viewed.slice(0, 6).map((v) => '<div class="product-card"><a href="' + v.url + '" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><span class="pname">' + v.name + '</span><span class="stock-ok">View Again</span></a></div>').join("") + '</div>';
      main.appendChild(wrapper);
    }
  }
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
  if (w.length === 0) {
    var recs = (typeof ALL_PRODUCTS !== "undefined" && typeof RECS_ACTIVE !== "undefined" && RECS_ACTIVE ? ALL_PRODUCTS.slice(0,4) : []).map(function(p){return '<div class="product-card"><a href="/product-'+p.slug+'.html" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><span class="pname">'+p.name+'</span><span class="stock-ok">₹'+p.price.toLocaleString("en-IN")+'</span></a></div>'}).join("");
    document.querySelector("main").innerHTML = '<div style="max-width:800px;margin:20px auto;background:white;border-radius:8px;padding:24px;text-align:center"><h2>Your Wishlist is Empty</h2><p style="color:#565959;margin:12px 0">Save your favorite items</p><a href="/products.html" style="display:inline-block;padding:12px 32px;background:#ffd814;border:1px solid #fcd200;border-radius:24px;text-decoration:none;color:#0f1111;font-weight:600;margin-bottom:20px">Discover Products</a>'+(recs?'<div class="section-header"><h2>Trending</h2></div><div class="products-grid">'+recs+'</div>':'')+'</div>';
    return;
  }
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
// ── Back to Top ──
window.onscroll = function() {
  var btn = document.getElementById("backToTop");
  if (btn) btn.style.display = window.scrollY > 400 ? "flex" : "none";
};
function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
// ── Product Image Gallery ──
function switchImg(slug, idx, src) {
  var main = document.getElementById("mainImg-"+slug);
  var wrap = document.getElementById("mainWrap-"+slug);
  var vid = document.getElementById("vidWrap-"+slug);
  if (vid) vid.style.display = "none";
  if (wrap) { wrap.style.display = "block"; wrap.style.cursor = "zoom-in"; }
  if (main) { main.src = src; main.style.opacity = "1"; }
  var thumbs = document.querySelectorAll("#thumbs-"+slug+" img");
  thumbs.forEach(function(t,i){ t.classList.toggle("active", i===idx); });
  var result = document.getElementById("zoomResult-"+slug);
  if (result) result.style.backgroundImage = "url("+src+")";
}
var galleryImgs = {}; // slug -> [src1, src2, ...]
var galleryIdx = {};
function navGallery(slug, dir) {
  if (!galleryImgs[slug]) {
    var m = document.getElementById("mainImg-"+slug);
    if (!m) return;
    var imgs = [m.src];
    var thumbs = document.querySelectorAll("#thumbs-"+slug+" img");
    thumbs.forEach(function(t){ imgs.push(t.src); });
    galleryImgs[slug] = imgs;
    galleryIdx[slug] = 0;
  }
  var idx = (galleryIdx[slug]||0) + dir;
  var imgs = galleryImgs[slug];
  if (idx < 0) idx = imgs.length - 1;
  if (idx >= imgs.length) idx = 0;
  galleryIdx[slug] = idx;
  var main = document.getElementById("mainImg-"+slug);
  if (main) main.src = imgs[idx];
  var result = document.getElementById("zoomResult-"+slug);
  if (result) result.style.backgroundImage = "url("+imgs[idx]+")";
  var thumbs = document.querySelectorAll("#thumbs-"+slug+" img");
  thumbs.forEach(function(t,i){ t.classList.toggle("active", i===idx); });
}
function showVideo(slug) {
  var wrap = document.getElementById("mainWrap-"+slug);
  var vid = document.getElementById("vidWrap-"+slug);
  if (wrap) { wrap.style.display = "none"; wrap.style.cursor = "default"; }
  if (vid) vid.style.display = "block";
}
// ── Image Zoom (Amazon-style magnifier) ──
function initZoom(slug) {
  var wrap = document.getElementById("mainWrap-"+slug);
  var img = document.getElementById("mainImg-"+slug);
  var lens = document.getElementById("zoomLens-"+slug);
  var result = document.getElementById("zoomResult-"+slug);
  if (!wrap || !img || !lens || !result) return;
  var zw = 400, zh = 400; // zoom result size
  function moveZoom(e) {
    var rect = img.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var lw = lens.offsetWidth, lh = lens.offsetHeight;
    var lx = x - lw/2, ly = y - lh/2;
    if (lx < 0) lx = 0; if (ly < 0) ly = 0;
    if (lx > rect.width - lw) lx = rect.width - lw;
    if (ly > rect.height - lh) ly = rect.height - lh;
    lens.style.left = lx + "px";
    lens.style.top = ly + "px";
    var rx = (x / rect.width) * (img.naturalWidth * (zw/img.offsetWidth)) - zw/2;
    var ry = (y / rect.height) * (img.naturalHeight * (zh/img.offsetHeight)) - zh/2;
    result.style.backgroundPosition = "-"+rx+"px -"+ry+"px";
    result.style.backgroundSize = (img.naturalWidth * (zw/img.offsetWidth)) + "px " + (img.naturalHeight * (zh/img.offsetHeight)) + "px";
  }
  wrap.addEventListener("mouseenter", function(){ lens.style.display="block"; result.style.display="block"; });
  wrap.addEventListener("mousemove", moveZoom);
  wrap.addEventListener("mouseleave", function(){ lens.style.display="none"; result.style.display="none"; });
}
document.addEventListener("DOMContentLoaded", function() {
  // Initialize zoom for all product images
  try {
    var path = window.location.pathname;
    var m = path.match(/product-([^.]+)/);
    if (m) initZoom(m[1]);
  } catch(e) {}
});
// ── Delivery Pincode Checker ──
function checkPincode(slug) {
  var pin = document.getElementById("pincode-"+slug).value.trim();
  var msg = document.getElementById("pincodeMsg-"+slug);
  if (!/^[0-9]{6}$/.test(pin)) { msg.innerHTML = '<span style="color:#cc0c39">Please enter a valid 6-digit pincode</span>'; return; }
  var p = parseInt(pin);
  if (p >= 110000 && p <= 119999) msg.innerHTML = '<span style="color:#007600">✓ Delivery available in Delhi/NCR — 2-3 days</span>';
  else if (p >= 400000 && p <= 409999) msg.innerHTML = '<span style="color:#007600">✓ Delivery available in Mumbai — 3-4 days</span>';
  else if (p >= 560000 && p <= 569999) msg.innerHTML = '<span style="color:#007600">✓ Delivery available in Bangalore — 3-4 days</span>';
  else if (p >= 500000 && p <= 509999) msg.innerHTML = '<span style="color:#007600">✓ Delivery available in Hyderabad — 3-5 days</span>';
  else if (p >= 600000 && p <= 609999) msg.innerHTML = '<span style="color:#007600">✓ Delivery available in Chennai — 4-5 days</span>';
  else msg.innerHTML = '<span style="color:#c45500">⚠ Delivery may take 5-7 days in this area</span>';
}
// ── Share ──
function shareProduct(type, name, url) {
  var shareUrl = "";
  if (type === "whatsapp") shareUrl = "https://wa.me/?text=" + encodeURIComponent(name + " - " + decodeURIComponent(url));
  else if (type === "facebook") shareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + url;
  else if (type === "twitter") shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(name) + "&url=" + url;
  if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=400");
}
function copyLink(slug) {
  var url = window.location.origin + "/product-" + slug + ".html";
  if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function(){ alert("Link copied!"); }); }
  else { var t = document.createElement("textarea"); t.value = url; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); alert("Link copied!"); }
}
// ── Q&A ──
function getQA(slug) { try { return JSON.parse(localStorage.getItem("extora_qa_"+slug) || "[]"); } catch { return []; } }
function saveQA(slug, qa) { localStorage.setItem("extora_qa_"+slug, JSON.stringify(qa)); renderQA(slug); }
function renderQA(slug) {
  var qa = getQA(slug); var el = document.getElementById("qaList-"+slug);
  if (!el) return;
  if (qa.length === 0) { el.innerHTML = '<p style="color:#565959;font-size:.85rem">No questions yet. Ask the first!</p>'; return; }
  el.innerHTML = qa.map(function(q) {
    return '<div style="border-bottom:1px solid #e7e7e7;padding:12px 0"><p style="color:#0f1111;font-size:.9rem;font-weight:600;margin:0 0 4px">Q: '+q.question+'</p>' +
    (q.answer ? '<p style="color:#007600;font-size:.85rem;margin:0;">A: '+q.answer+'</p>' : '<p style="color:#565959;font-size:.8rem;margin:0;font-style:italic">Waiting for answer...</p>') +
    '</div>';
  }).join("");
}
function askQuestion(slug) {
  var input = document.getElementById("qaInput-"+slug);
  var msg = document.getElementById("qaMsg-"+slug);
  var q = (input.value||"").trim();
  if (q.length < 3) { msg.textContent = "Please enter a valid question"; msg.style.color = "#cc0c39"; return; }
  var qa = getQA(slug);
  qa.push({question: q, answer: "", date: new Date().toISOString()});
  saveQA(slug, qa);
  input.value = "";
  msg.textContent = "Question submitted!"; msg.style.color = "#007600";
}
// ── Notify Me ──
function notifyMe(slug, name) {
  var email = prompt("Enter your email to be notified when " + (name||"this item") + " is back in stock:");
  if (email) {
    var alerts = {};
    try { alerts = JSON.parse(localStorage.getItem("extora_alerts") || "{}"); } catch(e) {}
    alerts[slug] = { name: name, email: email, date: new Date().toISOString() };
    localStorage.setItem("extora_alerts", JSON.stringify(alerts));
    alert("You will be notified at " + email + " when this item is back in stock!");
  }
}
function notifyMe2(el) { var slug=el.getAttribute("data-slug"); var name=el.getAttribute("data-name"); notifyMe(slug,name); }
// ── Deal Countdown Timer ──
function updateDealTimer() {
  var now = new Date();
  var end = new Date(now);
  end.setHours(23,59,59,0);
  var diff = Math.max(0, Math.floor((end - now) / 1000));
  var h = Math.floor(diff/3600), m = Math.floor((diff%3600)/60), s = diff%60;
  h = h<10?"0"+h:h; m = m<10?"0"+m:m; s = s<10?"0"+s:s;
  var ids = ['hpTimerH','hpTimerM','hpTimerS','dealTimerH','dealTimerM','dealTimerS'];
  ids.forEach(function(id){ var el=document.getElementById(id); if(el) { if(id.indexOf('H')>-1)el.textContent=h; else if(id.indexOf('M')>-1)el.textContent=m; else el.textContent=s; } });
}
setInterval(updateDealTimer, 1000);
updateDealTimer();
// ── Review Helpful Votes ──
function getVotes(rid) { try { return JSON.parse(localStorage.getItem("extora_vote_"+rid) || '{"yes":0,"no":0}'); } catch { return {yes:0,no:0}; } }
function voteHelpful(rid, type) {
  var myVote = localStorage.getItem("extora_myvote_"+rid);
  if (myVote) return;
  var v = getVotes(rid); v[type] = (v[type]||0) + 1;
  localStorage.setItem("extora_vote_"+rid, JSON.stringify(v));
  localStorage.setItem("extora_myvote_"+rid, type);
  var yesEl = document.getElementById("yesCount-"+rid), noEl = document.getElementById("noCount-"+rid);
  var yesBtn = document.getElementById("yes-"+rid), noBtn = document.getElementById("no-"+rid);
  if (yesEl) yesEl.textContent = v.yes;
  if (noEl) noEl.textContent = v.no;
  if (yesBtn && type==="yes") { yesBtn.style.borderColor="#007185"; yesBtn.style.color="#007185"; yesBtn.style.fontWeight="600"; }
  if (noBtn && type==="no") { noBtn.style.borderColor="#007185"; noBtn.style.color="#007185"; noBtn.style.fontWeight="600"; }
}
function initVotes() {
  document.querySelectorAll(".helpful-vote button").forEach(function(btn){
    var rid = btn.id.split("-")[1];
    var v = getVotes(rid);
    var yesEl = document.getElementById("yesCount-"+rid), noEl = document.getElementById("noCount-"+rid);
    if (yesEl) yesEl.textContent = v.yes||0;
    if (noEl) noEl.textContent = v.no||0;
    var myVote = localStorage.getItem("extora_myvote_"+rid);
    if (myVote) { var b = document.getElementById(myVote+"-"+rid); if (b) { b.style.borderColor="#007185"; b.style.color="#007185"; b.style.fontWeight="600"; } }
  });
}
// ── Related Searches on Search Page ──
function showRelatedSearches(query) {
  var noRes = document.getElementById("noResults");
  if (!noRes || noRes.style.display === "none") return;
  if (noRes.querySelector(".related-search")) return;
  var cats = ALL_PRODUCTS.map(function(p){return p.category}).filter(function(v,i,a){return a.indexOf(v)===i}).slice(0,4);
  var html = '<div style="margin-top:20px"><p style="color:#565959;font-size:.85rem;margin-bottom:8px">Try searching for:</p>' +
    cats.map(function(t){return '<a href="?q='+encodeURIComponent(t)+'" class="related-search">'+t+'</a>'}).join(" ") +
    '<div style="margin-top:12px"><a href="/products.html" class="related-search" style="background:#ffd814;border-color:#fcd200">Browse All Products</a></div></div>';
  noRes.innerHTML = noRes.innerHTML + html;
}
</script>
<div class="compare-bar" id="compareBar" style="display:none">
<div class="cb-items" id="compareItems"></div>
<div class="cb-actions">
<button class="cb-clear" onclick="clearCompare()">Clear</button>
<button class="cb-compare" onclick="showCompare()">Compare Now</button>
</div>
</div>
<button class="back-to-top" id="backToTop" onclick="scrollToTop()" title="Back to top">▲</button>
${customJs ? "<script>\n// Custom JS from theme settings\n" + customJs + "\n</script>" : ""}
</body></html>`;
}

function productCard(p: any): string {
  const img = p.images?.[0] ?? "";
  const price = Number(p.price ?? 0);
  const mrp = p.mrp ? Number(p.mrp) : null;
  const discount = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : (p.discountPercent ? Number(p.discountPercent) : 0);
  const rating = Number(p.rating ?? 0);
  const stockQty = Number(p.stockQty ?? 10);
  const stockStatus = String(p.stockStatus ?? "instock");
  const isBestSeller = rating >= 4.5 && (p.reviews ?? 0) >= 100;
  let stockHtml = '<span class="stock-ok">In Stock</span>';
  if (stockStatus === "outofstock" || stockQty <= 0) stockHtml = '<span class="stock-no">Out of Stock</span>';
  else if (stockQty <= 3) stockHtml = `<span class="stock-low">Only ${stockQty} left — order soon</span>`;
  else if (stockStatus === "low" || stockQty <= 5) stockHtml = `<span class="stock-low">Only ${stockQty} left</span>`;
  return `<div class="product-card">
<a href="/product-${e(p.slug)}.html">
<span class="wishlist-btn" data-slug="${e(p.slug)}" data-name="${e(p.name)}" onclick="toggleWishlist(this);event.preventDefault();event.stopPropagation()">♡</span>
<span class="compare-check" onclick="toggleCompare(this);event.preventDefault();event.stopPropagation()" data-slug="${e(p.slug)}" data-name="${e(p.name)}" data-price="${price}" data-category="${e(p.category)}" data-brand="${e(p.brand)}" data-img="${e(img)}" data-rating="${rating}" data-reviews="${p.reviews ?? 0}">◻</span>
<div class="img-wrap">${img ? `<img src="${e(img)}" alt="" loading="lazy">` : "No Image"}</div>
<span class="pname">${e(p.name)}</span>
${rating > 0 ? `<span class="stars">${stars(rating)}</span>` : ""}
<div class="pr"><span class="p">${rupee(price)}</span>${mrp && mrp > price ? `<span class="mrp">${rupee(mrp)}</span> <span class="save-tag">Save ${rupee(mrp - price)}</span>` : ""}</div>
${discount > 0 ? `<span class="badge">-${discount}%</span>` : ""}
${p.dealType ? `<span class="badge" style="background:#c45500">${e(p.dealLabel ?? p.dealType)}</span>` : ""}
${isBestSeller ? `<span class="badge" style="background:#e67a00">Best Seller</span>` : ""}
${price >= 499 ? `<span class="badge" style="background:#007600">Free Delivery</span>` : ""}
<span style="display:flex;align-items:center;margin-top:auto">${stockHtml}${stockStatus === "outofstock" || stockQty <= 0 ? `<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#eee;border:1px solid #ccc;border-radius:16px;font-size:.75rem;cursor:pointer;color:#888" onclick="notifyMe('${e(p.slug)}','${e(p.name)}');event.preventDefault();event.stopPropagation()">Notify Me</button>` : `<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#ffd814;border:1px solid #fcd200;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="${e(p.name)}" data-price="${price}" data-img="${e(img)}" data-slug="${e(p.slug)}" onclick="addToCart(this);return false">Add to Cart</button>`}</span>
</a>
</div>`;
}

export async function publishSite(prisma: PrismaClient, logger: Logger): Promise<PublishedSite> {
  const siteName = String((await prisma.systemConfig.findUnique({ where: { key: "site_name" } }))?.value ?? "Extora.in");
  const outputDir = process.env.PUBLISH_DIR ?? join(process.cwd(), "published");
  if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true });

  const pages: PageData[] = [];
  const rawProducts = await (prisma as any).product.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 50 });
  const rawCategories = await (prisma as any).productCategory.findMany({ orderBy: { name: "asc" } });
  const contentEntries = await (prisma as any).contentEntry.findMany({ where: { status: "published" } });
  const site = { name: siteName };

  // ── Load theme settings from DB ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const themeSettingsRaw = await (prisma as any).themeSetting.findMany({ where: { themeName: "default" } });
  const themeSettings: Record<string, any> = {};
  for (const row of themeSettingsRaw) { themeSettings[row.key] = row.value; }
  logger.info(`Loaded ${Object.keys(themeSettings).length} theme settings`);

  // ── Check active plugins for gating ──
  let isCommerceActive = true, isCmsActive = true, isAuthActive = true, isSeoActive = true, isRecsActive = true;
  let isRazorpayActive = false, isCodEnabled = true;
  try {
    const plugs = await (prisma as any).plugin.findMany({ where: { isActive: true } });
    const names = plugs.map((p: any) => p.name ?? "");
    isCommerceActive = names.some((n: string) => n.includes("commerce"));
    isCmsActive = names.some((n: string) => n.includes("cms"));
    isAuthActive = names.some((n: string) => n.includes("auth"));
    isSeoActive = names.some((n: string) => n.includes("seo"));
    isRecsActive = names.some((n: string) => n.includes("recommendations"));
    isRazorpayActive = names.some((n: string) => n.includes("razorpay"));
    // Check COD config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const codConfig = await (prisma as any).systemConfig.findUnique({ where: { key: "cod_enabled" } });
    isCodEnabled = codConfig ? String(codConfig.value) === "true" : true;
  } catch { /* plugin table optional */ }
  const pluginState = { commerce: isCommerceActive, cms: isCmsActive, auth: isAuthActive, seo: isSeoActive, recs: isRecsActive, cod: isCodEnabled, razorpay: isRazorpayActive };

  // If commerce disabled, clear products + categories so no commerce pages are generated
  const products = isCommerceActive ? rawProducts : [];
  const categories = isCommerceActive ? rawCategories : [];
  const deals = products.filter((p: any) => p.dealType);

  // ── HOMEPAGE ──
  const hpSections: string[] = [];
  if (deals.length > 0) hpSections.push(`<div class="section-header"><h2>Today's Deals <span class="deal-timer" id="hpDealTimer">Ends in: <span class="time-box" id="hpTimerH">00</span>h <span class="time-box" id="hpTimerM">00</span>m <span class="time-box" id="hpTimerS">00</span>s</span></h2><a href="/deals.html">See all</a></div><div class="products-grid">${deals.slice(0, 6).map(productCard).join("")}</div>`);
  // Trending: sort by rating * reviews (popularity score) — only if recommendations active
  if (isRecsActive) {
    const trending = [...products].sort((a: any, b: any) => ((b.rating ?? 0) * (b.reviews ?? 1)) - ((a.rating ?? 0) * (a.reviews ?? 1)));
    hpSections.push(`<div class="section-header"><h2>Trending Products</h2><a href="/products.html">See all</a></div><div class="products-grid">${trending.slice(0, 8).map(productCard).join("")}</div>`);
  }
  const featured = products.slice(0, 12);
  hpSections.push(`<div class="section-header"><h2>Featured Products</h2></div><div class="products-grid">${featured.map(productCard).join("")}</div>`);
  if (categories.length) hpSections.push(`<div class="section-header"><h2>Top Categories</h2><a href="/products.html">See all</a></div><div style="max-width:1500px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;padding:0 15px 20px">${categories.slice(0, 6).map((c: any) => `<div style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);transition:box-shadow .2s"><div style="height:160px;background:linear-gradient(135deg,#f0f4ff,#e8f0fe);display:flex;align-items:center;justify-content:center;font-size:3rem">${e(c.name).charAt(0).toUpperCase()}</div><div style="padding:16px"><h3 style="font-size:.95rem;margin:0 0 4px">${e(c.name)}</h3><p style="color:#565959;font-size:.8rem;margin:0 0 12px">${e(c.description).slice(0,60) || "Browse products"}</p><a href="/category-${e(c.slug)}.html" style="color:#007185;font-size:.85rem;text-decoration:none;font-weight:600">Shop now →</a></div></div>`).join("")}</div>`);
  // Recently Viewed (client-side render)
  hpSections.push(`<div id="homeRecentlyViewed"></div><script>try{var v=JSON.parse(localStorage.getItem("extora_viewed")||"[]");if(v.length>0){document.getElementById("homeRecentlyViewed").innerHTML='<div class="section-header"><h2>Recently Viewed</h2></div><div class="products-grid">'+v.slice(0,6).map(function(x){return'<div class="product-card"><a href="'+x.url+'" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><span class="pname">'+x.name+'</span><span class="stock-ok">View Again</span></a></div>'}).join("")+'</div>'}}catch(e){}</script>`);
  pages.push({ slug: "index", title: siteName, description: "Online Shopping", content: `<div style="background:linear-gradient(180deg,#3a5a8c 0,#131921 350px,#eaeded 350px);padding:30px 15px 60px"><div style="max-width:1500px;margin:0 auto"><h1 style="font-size:2rem;color:white;text-shadow:0 1px 2px rgba(0,0,0,.3)">${e(siteName)}</h1><p style="color:rgba(255,255,255,.9);font-size:1.1rem">Great products, great prices</p></div></div>${hpSections.join("")}` });

  // ── PRODUCT DETAIL PAGES (Amazon.in style) ──
  for (const p of products) {
    const imgs = (Array.isArray(p.images) ? p.images.map(String) : []) as string[];
    const firstImg = imgs[0] ?? "";
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

    const specsRaw = p.specs || [];
    const specs = Array.isArray(specsRaw) ? specsRaw : (typeof specsRaw === "object" ? Object.entries(specsRaw).map(([k, v]) => ({ label: k, value: v })) : []);
    const specRows = specs.map((s: any) => `<tr><td>${e(s.label ?? s.key ?? "")}</td><td>${e(s.value ?? "")}</td></tr>`).join("");

    let videoHtml = "";
    if (p.videoUrl) {
      const vu = String(p.videoUrl);
      if (vu.includes("youtube.com") || vu.includes("youtu.be")) {
        const embedUrl = vu.replace("watch?v=","embed/").replace("youtu.be/","youtube.com/embed/");
        videoHtml = `<div class="video-wrap" id="vidWrap-${e(p.slug)}"><iframe src="${e(embedUrl)}" allowfullscreen></iframe></div>`;
      } else {
        videoHtml = `<div class="video-wrap" id="vidWrap-${e(p.slug)}"><video src="${e(vu)}" controls></video></div>`;
      }
    }

    pages.push({
      slug: `product-${e(p.slug)}`,
      title: String(p.name),
      description: String(p.shortDesc ?? "").slice(0, 160),
      content: `<div class="breadcrumb"><a href="/">Home</a> › <a href="/products.html">Products</a>${p.brand ? ` › <a href="/brand-${e(String(p.brand).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''))}.html">${e(p.brand)}</a>` : ""} › <span style="color:#c45500">${e(p.name)}</span></div>
<div class="container"><div class="pdetail">
<div class="gallery">
<div class="main-wrap" id="mainWrap-${e(p.slug)}">
${imgs.length > 0 ? `<img src="${e(imgs[0])}" class="main-img" id="mainImg-${e(p.slug)}" alt="${e(p.name)}">` : `<div class="main-img" style="display:flex;align-items:center;justify-content:center;color:#999;background:white">No Image</div>`}
${imgs.length > 0 ? `<div class="zoom-lens" id="zoomLens-${e(p.slug)}"></div><div class="zoom-result" id="zoomResult-${e(p.slug)}" style="background-image:url(${e(imgs[0])})"></div>` : ""}
${imgs.length > 1 ? `<button class="gallery-nav prev" onclick="navGallery('${e(p.slug)}',-1)">‹</button><button class="gallery-nav next" onclick="navGallery('${e(p.slug)}',1)">›</button>` : ""}
</div>
${videoHtml}
<div class="thumbs" id="thumbs-${e(p.slug)}">
${imgs.slice(0, 8).map((img, idx) => `<img src="${e(img)}" class="${idx === 0 ? "active" : ""}" onclick="switchImg('${e(p.slug)}',${idx},'${e(img)}')" alt="">`).join("")}
${p.videoUrl ? `<div class="thumb-video" onclick="showVideo('${e(p.slug)}')"><img src="${imgs.length > 0 ? e(imgs[0]) : ""}" alt="Video" style="opacity:.5"></div>` : ""}
</div>
</div>
<div>
<h1>${e(p.name)}</h1>
${rating > 0 ? `<div class="rating-row"><span class="stars">${stars(rating)}</span><span class="revs">${p.reviews ?? 0} ratings</span></div>` : ""}
<hr class="divider">
${mrp && mrp > price ? `<div class="mrp-row">M.R.P: <span class="mrp">${rupee(mrp)}</span></div>` : ""}
<div class="price-row"><span class="price">${rupee(discount > 0 && mrp ? mrp > price ? price : price : price)}</span>${discount > 0 ? `<span class="discount">-${discount}%</span>` : ""}</div>
<div class="tax">Inclusive of all taxes</div>
${p.emiAvailable ? `<div class="emi">EMI starts at <span class="price">${rupee(emiPrice)}</span>. No Cost EMI available <a href="#" onclick="document.getElementById('emiTable-${e(p.slug)}').style.display='block';this.style.display='none';return false" style="color:#007185;font-size:.85rem;margin-left:8px">View Plans ▼</a><div id="emiTable-${e(p.slug)}" style="display:none;margin-top:8px;border:1px solid #e7e7e7;border-radius:4px;overflow:hidden"><table style="width:100%;border-collapse:collapse;font-size:.8rem"><thead><tr style="background:#f0f2f2"><th style="padding:6px 8px;text-align:left">Tenure</th><th style="padding:6px 8px;text-align:right">Monthly EMI</th><th style="padding:6px 8px;text-align:right">Total</th></tr></thead><tbody>${[3,6,9,12].map(m=>`<tr style="border-bottom:1px solid #e7e7e7"><td style="padding:6px 8px">${m} months</td><td style="padding:6px 8px;text-align:right;font-weight:600">${rupee(Math.round(price/m))}</td><td style="padding:6px 8px;text-align:right;color:#565959">${rupee(price)}</td></tr>`).join("")}</tbody></table><p style="font-size:.7rem;color:#565959;padding:6px 8px;margin:0">No Cost EMI available on select credit cards. Interest charged by bank.</p></div></div>` : ""}
<div class="offers"><h4>Offers</h4><ul>${offers.map((o: string) => `<li>${e(o)}</li>`).join("")}</ul></div>
<div class="features"><h4>Highlights</h4><ul>${highlights.map((h: string) => `<li>${e(h)}</li>`).join("")}</ul></div>
${p.stockStatus === "outofstock" || Number(p.stockQty ?? 10) <= 0 ? `<div class="stock-no" style="font-size:1.1rem;font-weight:600">Currently Unavailable</div>` : Number(p.stockQty ?? 10) <= 3 ? `<div class="stock-low" style="font-size:1rem;font-weight:600">Only ${p.stockQty} left in stock — order soon</div>` : Number(p.stockQty ?? 10) <= 5 ? `<div class="stock-low" style="font-size:1rem;font-weight:600">Only ${p.stockQty} left in stock</div>` : `<div class="stock">In Stock</div>`}
<div class="delivery">FREE delivery <strong>${e(p.deliveryDate ?? "Tomorrow")}</strong>. <a href="#" style="color:#007185">Details</a></div>
<div class="delivery">Delivered by <strong>${e(p.deliveryInfo ?? "Amazon")}</strong></div>
${p.codAvailable ? `<div class="cod">Cash on Delivery available</div>` : ""}
<div class="qty-row">Quantity: <select id="qtySelect-${e(p.slug)}" onchange="updateMultiBuy('${e(p.slug)}',${price},this.value)">${[1,2,3,4,5].map((n) => `<option value="${n}">${n}</option>`).join("")}</select><span id="multiBuyMsg-${e(p.slug)}" style="font-size:.82rem;color:#007600"></span></div>
${p.multiBuyEnabled !== false ? `<div style="font-size:.78rem;color:#565959;margin:-8px 0 8px">Buy 2: 5% off · Buy 3: 10% off · Buy 5: 15% off</div>` : ""}
<div class="buttons">
${p.stockStatus === "outofstock" || Number(p.stockQty ?? 10) <= 0 ? `
<button class="btn-cart" style="background:#eee;border:1px solid #ccc;color:#888;cursor:not-allowed;padding:12px 24px;border-radius:24px;font-size:1rem;font-weight:500" disabled>Currently Unavailable</button>
<button class="btn-buy" style="background:#eee;border:1px solid #ccc;color:#888;cursor:not-allowed;padding:12px 24px;border-radius:24px;font-size:1rem;font-weight:500" disabled>Buy Now</button>
 ` : `
<button type="button" class="btn-cart" data-name="${e(p.name)}" data-price="${p.price ?? 0}" data-img="${e(firstImg)}" data-slug="${e(p.slug)}" onclick="addToCart(this);return false">Add to Cart</button>
<button type="button" class="btn-buy" data-name="${e(p.name)}" data-price="${p.price ?? 0}" data-img="${e(firstImg)}" data-slug="${e(p.slug)}" onclick="buyNow(this);return false">Buy Now</button>
`}
</div>
<div class="secure">🔒 Secure transaction</div>
<div class="seller-info">Sold by <strong>${e(p.sellerName ?? "Extora Seller")}</strong> (${p.sellerRating ? stars(Number(p.sellerRating)) : "★★★★"} ${p.sellerRating ?? "4.0"})</div>
${p.brand ? `<div class="seller-info" style="margin-top:2px">Brand: <a href="/brand-${e(String(p.brand).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''))}.html" style="color:#007185;text-decoration:none">${e(p.brand)}</a></div>` : ""}
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
<div id="reviewForm-${e(p.slug)}" style="border-top:1px solid #e7e7e7;padding-top:16px;display:none">
<h4 style="margin-bottom:12px">Write a Review</h4>
<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px" id="starInput-${e(p.slug)}">
${[1,2,3,4,5].map((n) => `<span onclick="setRating('${e(p.slug)}',${n})" style="font-size:1.5rem;cursor:pointer;color:#ddd" id="star${n}-${e(p.slug)}">★</span>`).join("")}
</div>
<input type="hidden" id="ratingVal-${e(p.slug)}" value="5">
<input type="text" id="reviewTitle-${e(p.slug)}" placeholder="Review title" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;margin-bottom:8px;font-size:.9rem">
<textarea id="reviewContent-${e(p.slug)}" placeholder="Share your experience..." rows="3" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:.9rem;resize:vertical"></textarea>
<input type="text" id="reviewName-${e(p.slug)}" placeholder="Your name" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;margin:8px 0;font-size:.9rem">
<input type="email" id="reviewEmail-${e(p.slug)}" placeholder="Your email (used for order)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;margin-bottom:8px;font-size:.9rem">
<div style="margin:8px 0;font-size:.8rem"><input type="file" id="reviewImages-${e(p.slug)}" accept="image/*" multiple style="margin-bottom:4px" onchange="uploadReviewMedia('${e(p.slug)}','images')"><br><input type="file" id="reviewVideos-${e(p.slug)}" accept="video/*" multiple onchange="uploadReviewMedia('${e(p.slug)}','videos')"><span id="mediaStatus-${e(p.slug)}" style="color:#565959;font-size:.75rem"></span></div>
<button onclick="submitReview('${e(p.slug)}','${e(p.id)}')" style="padding:10px 24px;background:#ffd814;border:1px solid #fcd200;border-radius:20px;cursor:pointer;font-weight:600">Submit Review</button>
<span id="reviewMsg-${e(p.slug)}" style="color:#007600;margin-left:12px;font-size:.85rem"></span>
</div>
<div id="reviewGate-${e(p.slug)}" style="border-top:1px solid #e7e7e7;padding-top:16px">
<p style="color:#565959;font-size:.9rem" id="reviewGateMsg-${e(p.slug)}">Sign in to verify your purchase and write a review.</p>
</div>
</div>
<script>
var reviewMediaUrls_${sjs(p.slug)} = { images: [], videos: [] };
function setRating(slug, n) { document.getElementById("ratingVal-"+slug).value = n; for(var i=1;i<=5;i++) document.getElementById("star"+i+"-"+slug).style.color = i<=n ? "#febd69" : "#ddd"; }
function uploadReviewMedia(slug, type) {
  var input = document.getElementById(type === "images" ? "reviewImages-" + slug : "reviewVideos-" + slug);
  var status = document.getElementById("mediaStatus-" + slug);
  if (!input.files || !input.files.length) return;
  status.textContent = "Uploading...";
  for (var i = 0; i < input.files.length; i++) {
    var fd = new FormData(); fd.append("file", input.files[i]);
    fetch("/api/v1/media/upload", { method: "POST", body: fd })
      .then(function(r){ return r.json(); })
      .then(function(d){ if (d.url) { reviewMediaUrls_${sjs(p.slug)}[type].push(d.url); status.textContent = reviewMediaUrls_${sjs(p.slug)}[type].length + " uploaded"; } })
      .catch(function(){ status.textContent = "Upload failed"; });
  }
}
function submitReview(slug, productId) {
  var rating = document.getElementById("ratingVal-"+slug).value;
  var title = document.getElementById("reviewTitle-"+slug).value;
  var content = document.getElementById("reviewContent-"+slug).value;
  var author = document.getElementById("reviewName-"+slug).value || "Anonymous";
  var email = document.getElementById("reviewEmail-"+slug).value.trim();
  var msg = document.getElementById("reviewMsg-"+slug);
  if (!email) { msg.textContent = "Email required for purchase verification"; msg.style.color = "#cc0c39"; return; }
  fetch("/api/v1/reviews", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({productId:productId,rating:Number(rating),title:title,content:content,author:author,email:email,images:reviewMediaUrls_${sjs(p.slug)}.images,videos:reviewMediaUrls_${sjs(p.slug)}.videos}) })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (d.code === "NOT_PURCHASED") { msg.textContent = "You can only review products you have purchased."; msg.style.color = "#cc0c39"; }
      else if (d.code === "ALREADY_REVIEWED") { msg.textContent = "You have already reviewed this product."; msg.style.color = "#cc0c39"; }
      else { msg.textContent = d.message || "Review submitted! It will appear after approval."; msg.style.color = "#007600"; document.getElementById("reviewForm-"+slug).style.display = "none"; }
    })
    .catch(function(){ msg.textContent = "Failed to submit"; msg.style.color = "#cc0c39"; });
}
// Check if user can review + load existing reviews
fetch("/api/v1/reviews/${e(p.id)}").then(function(r){ return r.json(); }).then(function(d){
  var reviews = d.data || [];
  var el = document.getElementById("reviewList-${e(p.slug)}");
  if (reviews.length === 0) { el.innerHTML = '<p style="color:#565959;font-size:.9rem">No reviews yet. Be the first!</p>'; } else {
    el.innerHTML = reviews.map(function(r){ return '<div style="border-bottom:1px solid #e7e7e7;padding:12px 0"><div style="color:#febd69;margin-bottom:4px">'+"★".repeat(r.rating)+"☆".repeat(5-r.rating)+' <strong>'+r.title+'</strong></div><p style="color:#0f1111;font-size:.9rem;margin:4px 0">'+r.content+'</p>'+(Array.isArray(r.images)&&r.images.length?'<div style="display:flex;gap:8px;margin:8px 0">'+r.images.map(function(u){return'<img src="'+u+'" style="width:80px;height:80px;object-fit:cover;border-radius:4px;border:1px solid #e7e7e7" loading="lazy">';}).join("")+'</div>':'')+(Array.isArray(r.videos)&&r.videos.length?'<div style="display:flex;gap:8px;margin:8px 0">'+r.videos.map(function(u){return'<video src="'+u+'" controls style="width:120px;height:80px;border-radius:4px"></video>';}).join("")+'</div>':'')+'<span style="color:#565959;font-size:.8rem">By '+r.author+' on '+new Date(r.createdAt).toLocaleDateString()+'</span><div class="helpful-vote"><span style="font-size:.75rem;color:#565959">Helpful?</span><button onclick="voteHelpful(\\''+r.id+'\\',\\'yes\\')" id="yes-'+r.id+'" style="background:none;border:1px solid #ddd;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:.75rem;color:#565959">👍 Yes <span id="yesCount-'+r.id+'">0</span></button><button onclick="voteHelpful(\\''+r.id+'\\',\\'no\\')" id="no-'+r.id+'" style="background:none;border:1px solid #ddd;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:.75rem;color:#565959">👎 No <span id="noCount-'+r.id+'">0</span></button></div></div>'; }).join("");
  }
}).catch(function(){ document.getElementById("reviewLoading-${e(p.slug)}").textContent = "No reviews yet."; });
// Gate: check if user can review
(function(){
  var form = document.getElementById("reviewForm-${e(p.slug)}");
  var gate = document.getElementById("reviewGate-${e(p.slug)}");
  var gateMsg = document.getElementById("reviewGateMsg-${e(p.slug)}");
  var token = localStorage.getItem("at");
  if (token) {
    fetch("/api/v1/auth/session", { headers: { Authorization: "Bearer " + token } })
      .then(function(r){ return r.json(); })
      .then(function(d){
        var email = d.user ? d.user.email : "";
        if (email) {
          document.getElementById("reviewEmail-${e(p.slug)}").value = email;
          document.getElementById("reviewEmail-${e(p.slug)}").readOnly = true;
          fetch("/api/v1/reviews/check?productId=" + encodeURIComponent("${e(p.id)}") + "&email=" + encodeURIComponent(email))
            .then(function(r2){ return r2.json(); })
            .then(function(check){
              if (check.canReview) {
                form.style.display = "block"; gate.style.display = "none";
              } else if (check.reason === "Already reviewed") {
                gateMsg.textContent = "You have already reviewed this product. Thank you!";
              } else {
                gateMsg.textContent = "Only verified purchasers can review. Buy this product to leave a review.";
              }
            });
        } else {
          gateMsg.innerHTML = '<a href="/account.html" style="color:#007185">Sign in</a> to write a review for your purchased items.';
        }
      });
  } else {
    gateMsg.innerHTML = '<a href="/account.html" style="color:#007185">Sign in</a> to verify purchase and write a review.';
  }
})();
</script>

<div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:16px">
<div style="background:white;border-radius:4px;padding:20px">
<h4 style="margin:0 0 8px;font-size:.95rem">Check Delivery</h4>
<div style="display:flex;gap:8px">
<input type="text" id="pincode-${e(p.slug)}" maxlength="6" placeholder="Enter pincode" style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:.9rem">
<button onclick="checkPincode('${e(p.slug)}')" style="padding:8px 20px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-weight:600;cursor:pointer;font-size:.85rem;white-space:nowrap">Check</button>
</div>
<p id="pincodeMsg-${e(p.slug)}" style="font-size:.85rem;margin:8px 0 0;color:#565959">Delivery in most cities within 2-4 days</p>
</div>

<div style="background:white;border-radius:4px;padding:20px">
<h4 style="margin:0 0 8px;font-size:.95rem">Share</h4>
<div style="display:flex;gap:12px">
<a href="#" onclick="shareProduct('whatsapp','${e(p.name)}',encodeURIComponent(window.location.href));return false" style="background:#25D366;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:.9rem" title="WhatsApp">W</a>
<a href="#" onclick="shareProduct('facebook',encodeURIComponent(window.location.href));return false" style="background:#1877F2;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:.9rem" title="Facebook">f</a>
<a href="#" onclick="shareProduct('twitter','${e(p.name)}',encodeURIComponent(window.location.href));return false" style="background:#000;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:.8rem" title="X">X</a>
<a href="#" onclick="copyLink('${e(p.slug)}');return false" style="background:#eee;color:#555;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:.8rem" title="Copy Link">🔗</a>
</div>
</div>
</div>

<div id="qa-${e(p.slug)}" style="max-width:1200px;margin:20px auto;background:white;border-radius:4px;padding:28px">
<h3 style="margin-bottom:4px">Customer Questions & Answers</h3>
<div id="qaList-${e(p.slug)}" style="margin:16px 0">
<p style="color:#565959;font-size:.85rem">No questions yet. Ask the first!</p>
</div>
<div style="border-top:1px solid #e7e7e7;padding-top:16px;display:flex;gap:8px;flex-wrap:wrap">
<input type="text" id="qaInput-${e(p.slug)}" placeholder="Ask a question about this product..." style="flex:1;min-width:200px;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:.9rem">
<button onclick="askQuestion('${e(p.slug)}')" style="padding:10px 24px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;white-space:nowrap">Ask Question</button>
</div>
<p id="qaMsg-${e(p.slug)}" style="font-size:.85rem;margin:8px 0 0;color:#007600"></p>
</div>

${isRecsActive ? `<div class="section-header"><h2>Frequently Bought Together</h2></div>
<div class="products-grid">${(function() { const upsellIds: string[] = Array.isArray(p.upSellIds) ? p.upSellIds.map(String).filter(Boolean) : []; const crossSellIds: string[] = Array.isArray(p.crossSellIds) ? p.crossSellIds.map(String).filter(Boolean) : []; const fbt: any[] = []; for (const id of [...upsellIds, ...crossSellIds]) { const found = products.find((x: any) => String(x.id) === id || String(x.slug) === id); if (found) fbt.push(found); } if (fbt.length < 4) { for (const x of products) { if (x.id !== p.id && String(x.category) === String(p.category) && !fbt.find((f: any) => f.id === x.id)) { fbt.push(x); if (fbt.length >= 4) break; } } } return fbt.slice(0, 4).map(productCard).join(""); })()}</div>` : ""}

${isRecsActive ? `<div class="section-header"><h2>Customers Also Bought</h2></div>
<div class="products-grid">${products.filter((x: any) => x.id !== p.id && String(x.category) === String(p.category)).sort((a: any, b: any) => ((b.rating ?? 0) * (b.reviews ?? 1)) - ((a.rating ?? 0) * (a.reviews ?? 1))).slice(0, 6).map(productCard).join("")}</div>` : ""}

${isRecsActive ? `<div class="section-header"><h2>Customers Who Viewed This Also Viewed</h2></div>
<div class="products-grid">${products.filter((x: any) => x.id !== p.id).sort(() => Math.random() - 0.5).slice(0, 6).map(productCard).join("")}</div>` : ""}
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
    stockQty: Number(p.stockQty ?? 10), stockStatus: String(p.stockStatus ?? "instock"),
  })));
  const categoriesJson = JSON.stringify(categories.map((c: any) => ({ name: String(c.name ?? ""), slug: String(c.slug ?? "") })));

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
<div id="productsGrid" class="products-grid"><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div></div>
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
    ''+(p.stockStatus==='outofstock'||(p.stockQty||10)<=0?'<span class="stock-no">Out of Stock</span><button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#eee;border:1px solid #ccc;border-radius:16px;font-size:.75rem;cursor:pointer;color:#888" onclick="notifyMe(\''+p.slug+'\',\''+p.name.replace(/'/g,"&#39;")+'\');event.preventDefault();event.stopPropagation()"">Notify Me</button>':(p.stockStatus==='low'||(p.stockQty||10)<=5?'<span class="stock-low">Only '+(p.stockQty||10)+' left</span>':'<span class="stock-ok">In Stock</span>'))+(p.stockStatus==='outofstock'||(p.stockQty||10)<=0?'':'<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#ffd814;border:1px solid #fcd200;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" data-img="'+(p.img||'')+'" data-slug="'+p.slug+'" onclick="addToCart(this);return false">Add to Cart</button>')+'</span></a></div>';
  }).join("");
  updateVisibleHearts(); updateCompareChecks();
}
sortCategory();
</script>` });
  }
  // ── BRAND PAGES ──
  const brands = [...new Set(products.map((p: any) => String(p.brand ?? "")).filter(Boolean))] as string[];
  for (const brandName of brands) {
    const bSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    pages.push({ slug: `brand-${bSlug}`, title: brandName, description: `Shop ${brandName} products`,
      content: `<div class="page-content">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
<h1 style="margin:0">${e(brandName)}</h1>
<div style="display:flex;align-items:center;gap:8px">
<span style="color:#565959;font-size:.85rem" id="resultCount"></span>
<select id="sortSelect" onchange="sortBrand()" style="padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:.85rem;background:white;cursor:pointer">
<option value="default">Sort by: Featured</option>
<option value="priceAsc">Price: Low to High</option>
<option value="priceDesc">Price: High to Low</option>
<option value="rating">Rating: High to Low</option>
<option value="newest">Newest First</option>
<option value="discount">Biggest Discount</option>
</select>
</div>
</div>
<div id="productsGrid" class="products-grid"><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div></div>
</div>
<script>
var PRODUCTS = ${productJson2};
var BRAND = "${brandName}";
function sortBrand() {
  var sort = document.getElementById("sortSelect").value;
  var list = PRODUCTS.filter(function(p){return p.brand === BRAND});
  if (sort === "priceAsc") list.sort(function(a,b){return a.price - b.price});
  else if (sort === "priceDesc") list.sort(function(a,b){return b.price - a.price});
  else if (sort === "rating") list.sort(function(a,b){return (b.rating||0) - (a.rating||0)});
  else if (sort === "newest") list.sort(function(a,b){return (b.createdAt||"").localeCompare(a.createdAt||"")});
  else if (sort === "discount") list.sort(function(a,b){return (b.discountPercent||0) - (a.discountPercent||0)});
  document.getElementById("resultCount").textContent = list.length + " products";
  document.getElementById("productsGrid").innerHTML = list.length === 0 ? '<p style="text-align:center;padding:60px;color:#565959;grid-column:1/-1">No products from this brand yet.</p>' : list.map(function(p){
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
    ''+(p.stockStatus==='outofstock'||(p.stockQty||10)<=0?'<span class="stock-no">Out of Stock</span><button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#eee;border:1px solid #ccc;border-radius:16px;font-size:.75rem;cursor:pointer;color:#888" onclick="notifyMe(\''+p.slug+'\',\''+p.name.replace(/'/g,"&#39;")+'\');event.preventDefault();event.stopPropagation()"">Notify Me</button>':(p.stockStatus==='low'||(p.stockQty||10)<=5?'<span class="stock-low">Only '+(p.stockQty||10)+' left</span>':'<span class="stock-ok">In Stock</span>'))+(p.stockStatus==='outofstock'||(p.stockQty||10)<=0?'':'<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#ffd814;border:1px solid #fcd200;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" data-img="'+(p.img||'')+'" data-slug="'+p.slug+'" onclick="addToCart(this);return false">Add to Cart</button>')+'</span></a></div>';
  }).join("");
  updateVisibleHearts(); updateCompareChecks();
}
sortBrand();
</script>` });
  }
  if (deals.length) pages.push({ slug: "deals", title: "Today's Deals", description: "Limited time offers",
    content: `<div class="page-content">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
<h1 style="margin:0">Today's Deals <span class="deal-timer" style="margin-left:12px">Ends in: <span class="time-box" id="dealTimerH">00</span>h <span class="time-box" id="dealTimerM">00</span>m <span class="time-box" id="dealTimerS">00</span>s</span></h1>
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
<div id="productsGrid" class="products-grid"><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div></div>
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
    ''+(p.stockStatus==='outofstock'||(p.stockQty||10)<=0?'<span class="stock-no">Out of Stock</span><button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#eee;border:1px solid #ccc;border-radius:16px;font-size:.75rem;cursor:pointer;color:#888" onclick="notifyMe(\''+p.slug+'\',\''+p.name.replace(/'/g,"&#39;")+'\');event.preventDefault();event.stopPropagation()"">Notify Me</button>':(p.stockStatus==='low'||(p.stockQty||10)<=5?'<span class="stock-low">Only '+(p.stockQty||10)+' left</span>':'<span class="stock-ok">In Stock</span>'))+(p.stockStatus==='outofstock'||(p.stockQty||10)<=0?'':'<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#ffd814;border:1px solid #fcd200;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" data-img="'+(p.img||'')+'" data-slug="'+p.slug+'" onclick="addToCart(this);return false">Add</button>')+'</span></a></div>';
  }).join("");
  updateVisibleHearts(); updateCompareChecks();
}
sortDeals();
</script>` });
  pages.push({ slug: "products", title: "All Products", description: "Browse all",
    content: `<div class="page-content" style="display:flex;gap:24px;flex-wrap:wrap">
<div class="filter-sidebar" style="min-width:220px;max-width:280px;flex:1;align-self:start">
<h4>Filter by Category</h4>
<div id="categoryFilters"></div>
<button onclick="clearFilters()" style="margin-top:12px;padding:6px 16px;background:white;border:1px solid #ddd;border-radius:4px;cursor:pointer;font-size:.8rem;color:#007185">Clear Filters</button>
</div>
<div style="flex:3;min-width:300px">
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
<div id="productsGrid" class="products-grid"><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div></div>
</div>
</div>
<script>
var PRODUCTS = ${productJson2};
var CATEGORIES = ${categoriesJson};
function buildFilters() {
  var el = document.getElementById("categoryFilters");
  var counts = {};
  PRODUCTS.forEach(function(p){ counts[p.category] = (counts[p.category]||0) + 1; });
  el.innerHTML = CATEGORIES.map(function(c){
    return '<label><input type="checkbox" value="' + c.name + '" onchange="sortProducts()" checked> ' + c.name + ' <span class="filter-count">(' + (counts[c.name]||0) + ')</span></label>';
  }).join("");
}
function getCheckedCats() {
  var checked = [];
  document.querySelectorAll("#categoryFilters input[type=checkbox]:checked").forEach(function(cb){ checked.push(cb.value); });
  return checked;
}
function clearFilters() {
  document.querySelectorAll("#categoryFilters input[type=checkbox]").forEach(function(cb){ cb.checked = true; });
  sortProducts();
}
function sortProducts() {
  var sort = document.getElementById("sortSelect").value;
  var checkedCats = getCheckedCats();
  var list = PRODUCTS.filter(function(p){ return checkedCats.indexOf(p.category) !== -1; });
  if (sort === "priceAsc") list.sort(function(a,b){return a.price - b.price});
  else if (sort === "priceDesc") list.sort(function(a,b){return b.price - a.price});
  else if (sort === "rating") list.sort(function(a,b){return (b.rating||0) - (a.rating||0)});
  else if (sort === "newest") list.sort(function(a,b){return (b.createdAt||"").localeCompare(a.createdAt||"")});
  else if (sort === "discount") list.sort(function(a,b){return (b.discountPercent||0) - (a.discountPercent||0)});
  document.getElementById("resultCount").textContent = list.length + " products";
  document.getElementById("productsGrid").innerHTML = list.length === 0 ? '<p style="text-align:center;padding:60px;color:#565959;grid-column:1/-1">No products match your filters.</p>' : list.map(function(p){
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
    ''+(p.stockStatus==='outofstock'||(p.stockQty||10)<=0?'<span class="stock-no">Out of Stock</span><button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#eee;border:1px solid #ccc;border-radius:16px;font-size:.75rem;cursor:pointer;color:#888" onclick="notifyMe(\''+p.slug+'\',\''+p.name.replace(/'/g,"&#39;")+'\');event.preventDefault();event.stopPropagation()"">Notify Me</button>':(p.stockStatus==='low'||(p.stockQty||10)<=5?'<span class="stock-low">Only '+(p.stockQty||10)+' left</span>':'<span class="stock-ok">In Stock</span>'))+(p.stockStatus==='outofstock'||(p.stockQty||10)<=0?'':'<button class="btn-cart" style="margin-left:auto;padding:6px 12px;background:#ffd814;border:1px solid #fcd200;border-radius:16px;font-size:.75rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="'+p.name.replace(/'/g,"&#39;")+'" data-price="'+p.price+'" data-img="'+(p.img||'')+'" data-slug="'+p.slug+'" onclick="addToCart(this);return false">Add to Cart</button>')+'</span></a></div>';
  }).join("");
  updateVisibleHearts(); updateCompareChecks();
}
buildFilters(); sortProducts();
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
  if (isCmsActive) for (const entry of contentEntries) {
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
    stockQty: Number(p.stockQty ?? 10), stockStatus: String(p.stockStatus ?? "instock"),
  })));

  pages.push({
    slug: "search", title: "Search Products", description: "Find products",
    content: `<div class="page-content">
<h1>Search Products</h1>
<div style="margin-bottom:16px;display:flex;gap:8px">
<input type="text" id="searchInput" placeholder="Search by name, category, brand..." style="flex:1;padding:12px 16px;border:1px solid #ddd;border-radius:8px;font-size:1rem;outline:none" onkeyup="doSearch()" />
<select id="sortBy" onchange="doSearch()" style="padding:12px 16px;border:1px solid #ddd;border-radius:8px;font-size:.9rem;background:white;cursor:pointer"><option value="relevance">Sort: Relevance</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option><option value="rating">Rating</option><option value="discount">Discount</option></select>
<button onclick="doSearch()" style="padding:12px 24px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-weight:600;cursor:pointer;white-space:nowrap">Search</button>
</div>
<div style="display:flex;gap:20px">
<div id="filterSidebar" style="width:220px;min-width:220px;border-right:1px solid #e7e7e7;padding-right:16px">
<h4 style="font-size:.9rem;margin:0 0 8px">Price Range</h4>
<div style="display:flex;gap:4px;margin-bottom:12px"><input type="number" id="priceMin" placeholder="₹ Min" onchange="doSearch()" style="width:50%;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:.8rem"><span style="color:#999;font-size:.8rem;padding:6px 0">—</span><input type="number" id="priceMax" placeholder="₹ Max" onchange="doSearch()" style="width:50%;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:.8rem"></div>
<h4 style="font-size:.9rem;margin:12px 0 8px">Rating</h4>
<div id="ratingFilters" style="margin-bottom:12px">${[4,3,2,1].map(n => '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:.8rem;margin-bottom:4px"><input type="checkbox" value="'+String(n)+'" onchange="doSearch()"> '+'★'.repeat(n)+'☆'.repeat(5-n)+' & up</label>').join("")}</div>
<h4 style="font-size:.9rem;margin:12px 0 8px">Category <span id="catCount" style="font-weight:400;color:#999;font-size:.75rem"></span></h4>
<div id="categoryFilters" style="margin-bottom:12px;max-height:200px;overflow-y:auto"></div>
<h4 style="font-size:.9rem;margin:12px 0 8px">Brand <span id="brandCount" style="font-weight:400;color:#999;font-size:.75rem"></span></h4>
<div id="brandFilters" style="margin-bottom:12px;max-height:200px;overflow-y:auto"></div>
<button onclick="clearFilters()" style="width:100%;padding:8px;background:#eee;border:1px solid #ddd;border-radius:4px;cursor:pointer;font-size:.8rem">Clear All</button>
</div>
<div style="flex:1">
<div id="resultCount" style="font-size:.85rem;color:#565959;margin-bottom:8px"></div>
<div id="searchResults" class="products-grid"><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div><div class="skeleton-card"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line price"></div><div class="skeleton sk-btn"></div></div></div>
<p id="noResults" style="display:none;text-align:center;padding:40px;color:#565959">No products found. Try different filters.</p>
</div></div>
</div>
<script>
const ALL_PRODUCTS = ${productJson};
const params = new URLSearchParams(window.location.search);
const q = params.get("q");
if (q) { document.getElementById("searchInput").value = q; }

function getUniqueValues(field) {
  var seen = {}; var vals = [];
  ALL_PRODUCTS.forEach(function(p){ var v = p[field]; if (typeof v === "string" && v && !seen[v]) { seen[v] = 1; vals.push(v); } });
  return vals.sort();
}
(function buildFilters(){
  var htmlC = ""; getUniqueValues("category").forEach(function(c, i){ htmlC += '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:.8rem;margin-bottom:4px"><input type="checkbox" value="'+c.replace(/"/g,'&quot;')+'" onchange="doSearch()"> '+c+'</label>'; });
  document.getElementById("categoryFilters").innerHTML = htmlC;
  var htmlB = ""; getUniqueValues("brand").forEach(function(b, i){ htmlB += '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:.8rem;margin-bottom:4px"><input type="checkbox" value="'+b.replace(/"/g,'&quot;')+'" onchange="doSearch()"> '+b+'</label>'; });
  document.getElementById("brandFilters").innerHTML = htmlB;
})();

function getChecked(containerId) {
  var cbs = document.querySelectorAll("#"+containerId+" input[type=checkbox]:checked");
  var vals = []; cbs.forEach(function(cb){ vals.push(cb.value); }); return vals;
}
function doSearch() {
  var query = document.getElementById("searchInput").value.toLowerCase().trim();
  var container = document.getElementById("searchResults");
  var noRes = document.getElementById("noResults");
  var resultCount = document.getElementById("resultCount");
  var all = ALL_PRODUCTS;

  if (query) {
    all = all.filter(function(p){ return p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query); });
  }

  var selCats = getChecked("categoryFilters");
  if (selCats.length) all = all.filter(function(p){ return selCats.indexOf(p.category) !== -1; });

  var selBrands = getChecked("brandFilters");
  if (selBrands.length) all = all.filter(function(p){ return selBrands.indexOf(p.brand) !== -1; });

  var minPrice = parseFloat(document.getElementById("priceMin").value) || 0;
  var maxPrice = parseFloat(document.getElementById("priceMax").value) || Infinity;
  all = all.filter(function(p){ return p.price >= minPrice && p.price <= maxPrice; });

  var selRatings = getChecked("ratingFilters");
  if (selRatings.length) all = all.filter(function(p){ return selRatings.some(function(r){ return p.rating >= Number(r); }); });

  // Sort
  var sort = document.getElementById("sortBy").value;
  if (sort === "price_low") all.sort(function(a,b){ return a.price - b.price; });
  else if (sort === "price_high") all.sort(function(a,b){ return b.price - a.price; });
  else if (sort === "rating") all.sort(function(a,b){ return b.rating - a.rating; });
  else if (sort === "discount") all.sort(function(a,b){ var da=a.mrp&&a.mrp>a.price?((a.mrp-a.price)/a.mrp):0; var db=b.mrp&&b.mrp>b.price?((b.mrp-b.mrp)/b.price):0; return db-da; });

  resultCount.textContent = all.length + " result" + (all.length!==1?"s":"");

  if (all.length === 0) {
    container.innerHTML = "";
    noRes.style.display = "block";
  } else {
    noRes.style.display = "none";
    container.innerHTML = all.map(function(p){
      var mrp = p.mrp && p.mrp > p.price ? '<span class="mrp" style="font-size:.8rem;color:#565959;text-decoration:line-through">₹' + p.mrp.toLocaleString("en-IN") + '</span>' : '';
      var discount = p.mrp && p.mrp > p.price ? '<span class="badge">-' + Math.round((1-p.price/p.mrp)*100) + '%</span>' : '';
      return '<div class="product-card"><a href="/product-' + p.slug + '.html" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;padding:16px;height:100%"><div class="img-wrap">'+(p.img?'<img src="'+p.img+'" alt="" loading="lazy">':'<span style="color:#999">No Image</span>')+'</div><span class="pname">'+p.name+'</span>'+(p.rating>0?'<span class="stars">'+"★".repeat(Math.floor(p.rating))+'</span>':'')+'<div class="pr"><span class="p">₹'+p.price.toLocaleString("en-IN")+'</span>'+mrp+'</div>'+discount+(p.deal?'<span class="badge" style="background:#c45500">'+p.deal+'</span>':'')+'<span style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">'+(p.stockStatus==='outofstock'||(p.stockQty||10)<=0?'<span class="stock-no">Out of Stock</span><button class="btn-cart" style="padding:6px 12px;background:#eee;border:1px solid #ccc;border-radius:16px;font-size:.75rem;cursor:pointer;color:#888" onclick="notifyMe(\''+p.slug+'\',\''+p.name.replace(/'/g,"&#39;")+'\');event.preventDefault();event.stopPropagation()">Notify Me</button>':(p.stockStatus==='low'||(p.stockQty||10)<=5?'<span class="stock-low">Only '+(p.stockQty||10)+' left</span>':'<span class="stock-ok">In Stock</span>'))+'<button class="btn-cart" style="padding:5px 10px;background:#ffd814;border:1px solid #fcd200;border-radius:12px;font-size:.7rem;font-weight:600;cursor:pointer;color:#0f1111" data-name="'+p.name.replace(/"/g,'&quot;')+'" data-price="'+p.price+'" data-img="'+(p.img||'')+'" data-slug="'+p.slug+'" onclick="addToCart(this);return false">Add</button></span></a></div>';
    }).join("");
  }
}
function clearFilters(){
  document.querySelectorAll("#filterSidebar input[type=checkbox]").forEach(function(cb){ cb.checked = false; });
  document.getElementById("priceMin").value = "";
  document.getElementById("priceMax").value = "";
  document.getElementById("sortBy").value = "relevance";
  doSearch();
}
doSearch();
</script>`,
  });

   // ── CUSTOMER ACCOUNT PAGE ──
  if (isAuthActive) pages.push({
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
  if (isCommerceActive) pages.push({
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

  // ── TRACK ORDER PAGE ──
  if (isCommerceActive) pages.push({
    slug: "track-order", title: "Track Your Order", description: "Check order status",
    content: `<div class="page-content">
<h1>Track Your Order</h1>
<p style="color:#565959;margin-bottom:24px">Enter your order number and email to check delivery status.</p>
<div id="trackForm" style="max-width:440px">
<input type="text" id="trackOrderNo" placeholder="Order Number (e.g. EXT-123456)" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px;font-size:1rem">
<input type="email" id="trackEmail" placeholder="Email used for order" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px;font-size:1rem">
<button onclick="trackOrder()" style="width:100%;padding:12px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer">Track Order</button>
</div>
<div id="trackResult" style="margin-top:24px"></div>
<div id="trackOrdersList" style="margin-top:16px"></div>
<script>
function getStatusIndex(status) {
  const steps = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
  return steps.indexOf(status);
}
function trackOrder() {
  const orderNo = document.getElementById("trackOrderNo").value.trim();
  const email = document.getElementById("trackEmail").value.trim();
  if (!orderNo || !email) { alert("Please enter both order number and email"); return; }
  fetch("/api/v1/orders/track?orderNumber=" + encodeURIComponent(orderNo) + "&email=" + encodeURIComponent(email))
    .then(r => r.json()).then(d => {
      if (!d.data) { document.getElementById("trackResult").innerHTML = '<p style="color:#d00">Order not found. Please check your order number and email.</p>'; return; }
      const o = d.data;
      const steps = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
      const idx = steps.indexOf(o.status);
      const statusLabels = {confirmed:"Confirmed",processing:"Processing",shipped:"Shipped",out_for_delivery:"Out for Delivery",delivered:"Delivered"};
      const curLabel = statusLabels[o.status] || o.status || "Confirmed";
      const items = Array.isArray(o.items) ? o.items : (typeof o.items === "string" ? JSON.parse(o.items) : []);
      const bgColors = {confirmed:"#ffd814",processing:"#007185",shipped:"#007185",out_for_delivery:"#f90",delivered:"#007600"};
      document.getElementById("trackResult").innerHTML =
        '<div style="background:white;border-radius:8px;padding:24px">' +
        '<h2 style="margin:0 0 4px">Order #' + o.orderNumber + '</h2>' +
        '<p style="color:#565959;margin:0 0 16px">Placed on ' + new Date(o.createdAt).toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"}) + ' · ₹' + (o.total||0).toLocaleString("en-IN") + '</p>' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;position:relative">' +
        steps.map((s,i) => '<div style="flex:1;text-align:center;position:relative">' +
          '<div style="width:32px;height:32px;border-radius:50%;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:1rem;background:' + (i <= idx ? (s==="delivered"?"#007600":bgColors[s]) : "#ddd") + ';color:' + (i <= idx ? "#fff" : "#888") + '">' + (i <= idx ? (s==="delivered"?"✓":i+1) : i+1) + '</div>' +
          '<span style="font-size:.75rem;color:' + (i <= idx ? "#0f1111" : "#ccc") + ';font-weight:' + (i <= idx ? "600" : "400") + '">' + statusLabels[s] + '</span>' +
          (i < idx ? '<div style="position:absolute;top:16px;left:calc(50% + 20px);width:calc(100% - 40px);height:2px;background:#007600"></div>' : '') +
        '</div>').join("") +
        '</div>' +
        '<div style="border-top:1px solid #e7e7e7;padding-top:16px;margin-top:12px">' +
        '<h4 style="margin:0 0 8px">Status: <span style="color:' + (bgColors[o.status] || "#333") + '">' + curLabel + '</span></h4>' +
        '<p style="color:#0f1111;font-size:.9rem;margin:4px 0">' + items.length + ' item(s) · ₹' + (o.total||0).toLocaleString("en-IN") + '</p>' +
        '<p style="color:#565959;font-size:.8rem;margin-top:12px">Questions about your order? <a href="/contact.html" style=\\"color:#007185\\">Contact support</a></p>' +
        '</div></div>';
    }).catch(() => { document.getElementById("trackResult").innerHTML = '<p style="color:#d00">Something went wrong. Please try again.</p>'; });
}
// Auto-fill from URL params
(function(){
  const params = new URLSearchParams(location.search);
  const no = params.get("orderNumber") || params.get("no");
  const em = params.get("email");
  if (no) document.getElementById("trackOrderNo").value = no;
  if (em) document.getElementById("trackEmail").value = em;
  if (no && em) trackOrder();
})();
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
  if (isCommerceActive) pages.push({
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

  // ── CART PAGE ──
  if (isCommerceActive) pages.push({
    slug: "cart", title: "Shopping Cart", description: "View your cart and checkout",
    content: `<div class="page-content">
<h1>Shopping Cart</h1>
<div id="cartPageContent"><p style="color:#565959">Loading cart...</p></div>
<script>
document.addEventListener("DOMContentLoaded", function(){
  var c = getCart();
  if (c.length === 0) {
    document.getElementById("cartPageContent").innerHTML = '<div style="text-align:center;padding:40px"><h2>Your Cart is Empty</h2><p style="color:#565959;margin:12px 0">Browse our trending products</p><a href="/products.html" style="display:inline-block;padding:12px 32px;background:#ffd814;border:1px solid #fcd200;border-radius:24px;text-decoration:none;color:#0f1111;font-weight:600">Shop Now</a></div>';
    return;
  }
  var total = c.reduce(function(s,i){return s+i.price*i.qty;},0);
  var count = c.reduce(function(s,i){return s+i.qty;},0);
  var rows = c.map(function(i,idx){
    var imgTag = i.img ? '<img src="'+i.img+'" style="width:80px;height:80px;object-fit:cover;border-radius:4px;border:1px solid #e7e7e7" onerror="this.style.display=\\'none\\'">' : '<div style="width:80px;height:80px;border-radius:4px;background:#f0f2f2;display:flex;align-items:center;justify-content:center;color:#999;font-size:.65rem;border:1px solid #e7e7e7">No Img</div>';
    return '<tr><td style="padding:12px 8px;display:flex;align-items:center;gap:12px">'+imgTag+'<div><strong>'+i.name+'</strong><div class="cart-qty" style="margin-top:4px"><button onclick="cartPageChangeQty('+idx+',-1)">−</button><span>'+i.qty+'</span><button onclick="cartPageChangeQty('+idx+',1)">+</button></div></div></td><td style="padding:12px 8px;text-align:center">₹'+i.price.toLocaleString("en-IN")+'</td><td style="padding:12px 8px;text-align:right;font-weight:600">₹'+(i.price*i.qty).toLocaleString("en-IN")+'</td><td style="padding:12px 8px"><button onclick="cartPageRemove('+idx+')" style="background:#cc0c39;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:.75rem">Remove</button></td></tr>';
  }).join("");
  document.getElementById("cartPageContent").innerHTML = '<table style="width:100%;border-collapse:collapse;margin-bottom:20px"><thead><tr style="background:#f0f2f2"><th style="text-align:left;padding:10px">Product</th><th style="text-align:center;padding:10px;width:100px">Price</th><th style="text-align:right;padding:10px;width:120px">Subtotal</th><th style="width:80px"></th></tr></thead><tbody>'+rows+'</tbody><tfoot><tr style="font-weight:700;font-size:1.1rem;border-top:2px solid #0f1111"><td colspan="2" style="text-align:right;padding:16px 12px">Total ('+count+' items):</td><td style="text-align:right;padding:16px 12px">₹'+total.toLocaleString("en-IN")+'</td><td></td></tr></tfoot></table><div style="display:flex;gap:12px"><button onclick="checkout()" style="padding:12px 32px;background:#ffd814;border:1px solid #fcd200;border-radius:24px;font-size:1rem;cursor:pointer;font-weight:600">Proceed to Buy</button><a href="/index.html" style="padding:12px 24px;border:1px solid #ddd;border-radius:24px;text-decoration:none;color:#0f1111;font-size:.9rem;display:inline-flex;align-items:center">Continue Shopping</a></div>';
})();
function cartPageChangeQty(idx, delta) { var c = getCart(); if (idx<0||idx>=c.length) return; c[idx].qty+=delta; if (c[idx].qty<=0) c.splice(idx,1); saveCart(c); location.reload(); }
function cartPageRemove(idx) { var c = getCart(); c.splice(idx,1); saveCart(c); location.reload(); }
</script>
</div>`,
  });

  // ── CHECKOUT / PAYMENT PAGE ──
  if (isCommerceActive && isRazorpayActive) pages.push({
    slug: "checkout", title: "Secure Checkout", description: "Complete your payment",
    content: `<div class="page-content" style="max-width:500px;margin:40px auto">
<h1>Secure Checkout</h1>
<div id="checkoutStatus"><p style="color:#565959">Loading payment options...</p></div>
<script>
(function(){
  var params = new URLSearchParams(location.search);
  var amount = params.get("amount");
  var email = params.get("email");
  var token = params.get("token");

  if (!amount) {
    document.getElementById("checkoutStatus").innerHTML = '<p style="color:#cc0c39">No order amount specified. <a href="/cart.html">Return to cart</a></p>';
    return;
  }

  document.getElementById("checkoutStatus").innerHTML =
    '<div style="background:white;border:1px solid #e7e7e7;border-radius:8px;padding:24px">' +
    '<h3 style="margin:0 0 16px">Order Summary</h3>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Total Amount</span><span style="font-weight:700;font-size:1.2rem">₹' + Number(amount).toLocaleString("en-IN") + '</span></div>' +
    (email ? '<div style="font-size:.85rem;color:#565959;margin-bottom:16px">Email: ' + email + '</div>' : '') +
    '<hr style="border:none;border-top:1px solid #e7e7e7;margin:16px 0">' +
    '<h4 style="margin:0 0 12px">Select Payment Method</h4>' +
    '<label style="display:flex;align-items:center;gap:12px;padding:12px;border:2px solid #007185;border-radius:8px;cursor:pointer;margin-bottom:8px;background:#f0f8ff">' +
    '<input type="radio" name="payment" value="razorpay" checked style="accent-color:#007185">' +
    '<span style="font-weight:600">Pay Online</span><span style="color:#565959;font-size:.8rem">Credit/Debit Card, UPI, NetBanking</span></label>' +
    (typeof COD_AVAILABLE !== "undefined" && COD_AVAILABLE ?
    '<label style="display:flex;align-items:center;gap:12px;padding:12px;border:2px solid #e7e7e7;border-radius:8px;cursor:pointer;margin-bottom:12px">' +
    '<input type="radio" name="payment" value="cod"><span style="font-weight:600">Cash on Delivery</span><span style="color:#565959;font-size:.8rem">Pay when you receive</span></label>' : '') +
    '<button onclick="doRazorpayCheckout()" id="payBtn" style="width:100%;padding:14px;background:#ffd814;border:1px solid #fcd200;border-radius:24px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:8px">Pay ₹' + Number(amount).toLocaleString("en-IN") + '</button>' +
    '<p style="font-size:.7rem;color:#565959;text-align:center;margin-top:8px">🔒 Secured by Razorpay</p></div>';

  // Update button when payment method changes
  document.querySelectorAll('input[name="payment"]').forEach(function(radio){
    radio.addEventListener("change", function(){
      var btn = document.getElementById("payBtn");
      if (this.value === "cod") {
        btn.textContent = "Place Order (COD)";
        btn.onclick = function(){ doCodCheckout(amount, email, token); };
      } else {
        btn.textContent = "Pay ₹" + Number(amount).toLocaleString("en-IN");
        btn.onclick = function(){ doRazorpayCheckout(); };
      }
    });
  });
})();

function doCodCheckout(amount, email, token) {
  if (!token) { alert("Please sign in first"); location.href = "/account.html"; return; }
  fetch("/api/v1/commerce/checkout", { method:"POST", headers:{"Content-Type":"application/json", Authorization:"Bearer "+token}, body: JSON.stringify({email:email}) })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (d.data) {
        localStorage.removeItem("extora_cart");
        updateCartCount();
        document.getElementById("checkoutStatus").innerHTML = '<div style="text-align:center;padding:40px"><h2>Order Confirmed!</h2><p style="font-size:1.2rem;margin:16px 0">Order #' + d.data.orderNumber + '</p><p style="color:#565959">Amount: ₹' + Number(amount).toLocaleString("en-IN") + '</p><p style="color:#565959">Payment: Cash on Delivery</p><a href="/orders.html" style="color:#007185">View Orders</a> · <a href="/index.html" style="color:#007185;margin-left:12px">Continue Shopping</a></div>';
      }
    }).catch(function(){ alert("Checkout failed. Please try again."); });
}

function doRazorpayCheckout() {
  var params = new URLSearchParams(location.search);
  var amount = params.get("amount");
  var email = params.get("email");
  document.getElementById("payBtn").disabled = true;
  document.getElementById("payBtn").textContent = "Processing...";
  fetch("/api/v1/razorpay/order", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({amount: Number(amount), email: email}) })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (!d.data || !d.data.id) { alert("Payment gateway unavailable. Try COD."); document.getElementById("payBtn").disabled = false; document.getElementById("payBtn").textContent = "Pay ₹" + Number(amount).toLocaleString("en-IN"); return; }
      var options = {
        key: d.data.keyId,
        amount: d.data.amount,
        currency: d.data.currency || "INR",
        name: "Extora",
        description: "Order Payment",
        order_id: d.data.id,
        handler: function(response){
          fetch("/api/v1/razorpay/verify", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, email: email, amount: amount}) })
            .then(function(r2){ return r2.json(); })
            .then(function(v){
              if (v.data && v.data.verified) {
                localStorage.removeItem("extora_cart");
                updateCartCount();
                document.getElementById("checkoutStatus").innerHTML = '<div style="text-align:center;padding:40px"><h2>Payment Successful!</h2><p style="font-size:1.2rem;margin:16px 0">Order #' + v.data.orderNumber + '</p><p style="color:#565959">Amount Paid: ₹' + Number(amount).toLocaleString("en-IN") + '</p><p style="color:#007600;font-weight:600">✓ Payment Verified</p><a href="/orders.html" style="color:#007185">View Orders</a> · <a href="/index.html" style="color:#007185;margin-left:12px">Continue Shopping</a></div>';
              }
            });
        },
        prefill: { email: email },
        theme: { color: "#131921" }
      };
      var rzp = new (window as any).Razorpay(options);
      rzp.open();
      document.getElementById("payBtn").disabled = false;
      document.getElementById("payBtn").textContent = "Pay ₹" + Number(amount).toLocaleString("en-IN");
    }).catch(function(){ alert("Payment failed. Please try again."); document.getElementById("payBtn").disabled = false; document.getElementById("payBtn").textContent = "Pay ₹" + Number(amount).toLocaleString("en-IN"); });
}
</script>
</div>`,
  });

  // ── 404 NOT FOUND ──
  pages.push({
    slug: "404", title: "Page Not Found", description: "We can't find that page",
    content: `<div class="page-content" style="text-align:center;padding:60px 32px">
<div style="font-size:5rem;color:#ddd;margin-bottom:16px">404</div>
<h1 style="margin-bottom:8px">Page Not Found</h1>
<p style="color:#565959;font-size:1.1rem;margin-bottom:24px">Sorry, the page you're looking for doesn't exist or has been moved.</p>
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
<a href="/index.html" style="background:#ffd814;border:1px solid #fcd200;padding:12px 32px;border-radius:24px;text-decoration:none;color:#0f1111;font-weight:600">Go to Homepage</a>
<a href="/products.html" style="background:white;border:1px solid #ddd;padding:12px 32px;border-radius:24px;text-decoration:none;color:#007185;font-weight:600">Browse Products</a>
<a href="/search.html" style="background:white;border:1px solid #ddd;padding:12px 32px;border-radius:24px;text-decoration:none;color:#007185;font-weight:600">Search</a>
</div>
<div style="margin-top:32px;padding:16px;background:#f8f8f8;border-radius:8px;max-width:400px;margin-left:auto;margin-right:auto">
<p style="color:#565959;font-size:.85rem">Try searching for what you need:</p>
<div style="display:flex;gap:8px;margin-top:8px">
<input type="text" id="errSearch" placeholder="Search products..." style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:.9rem" onkeydown="if(event.key==='Enter')location.href='/search.html?q='+encodeURIComponent(this.value)">
<button onclick="var q=document.getElementById('errSearch').value;if(q)location.href='/search.html?q='+encodeURIComponent(q)" style="padding:8px 20px;background:#ffd814;border:1px solid #fcd200;border-radius:8px;font-weight:600;cursor:pointer">Go</button>
</div>
</div>
</div>`,
  });

  // ── WRITE FILES ──
  // Clean up old HTML files from previous publish (stale pages)
  try {
    const oldFiles = await readdir(outputDir);
    for (const f of oldFiles) {
      if (f.endsWith(".html") || f === "sitemap.xml" || f === "robots.txt") {
        await unlink(join(outputDir, f));
      }
    }
  } catch { /* ok if dir is empty */ }
  const allProducts = products.map((p: any) => ({
    name: String(p.name ?? ""), slug: String(p.slug ?? ""),
    category: String(p.category ?? ""), price: Number(p.price ?? 0),
  }));

  // Fetch SEO meta for product pages (only if SEO plugin active)
  const seoMetaMap: Record<string, any> = {};
  if (isSeoActive) {
    try {
      const metas = await (prisma as any).seoMeta.findMany() ?? [];
      for (const m of metas) seoMetaMap[`${m.resourceType}_${m.resourceId}`] = m;
    } catch { /* SEO table optional */ }
  }

  let totalSize = 0;
  for (const page of pages) {
    let resourceId = page.slug;
    if (page.slug.startsWith("product-")) resourceId = page.slug.replace("product-", "");
    else if (page.slug.startsWith("category-")) resourceId = page.slug.replace("category-", "");
    else if (page.slug.startsWith("brand-")) resourceId = page.slug.replace("brand-", "");
    const seoMeta = seoMetaMap[`product_${resourceId}`] ?? undefined;
    const html = layout(site, page.content, page.title, allProducts, pluginState, seoMeta, themeSettings);
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
