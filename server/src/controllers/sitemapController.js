const Product = require("../models/Product");
const Blog = require("../models/Blog");
const { frontendUrl } = require("../config/env");

const getSitemap = async (req, res) => {
  try {
    const origin = (frontendUrl ? String(frontendUrl).split(",")[0].trim() : "https://www.marblex.com").replace(/\/$/, "");
    const nowStr = new Date().toISOString().split("T")[0];

    const staticRoutes = [
      { path: "", priority: "1.0", changefreq: "daily" },
      { path: "/services", priority: "0.8", changefreq: "weekly" },
      { path: "/calculator", priority: "0.8", changefreq: "weekly" },
      { path: "/product-finder", priority: "0.8", changefreq: "weekly" },
      { path: "/about", priority: "0.7", changefreq: "monthly" },
      { path: "/catalogs", priority: "0.7", changefreq: "weekly" },
      { path: "/blogs", priority: "0.8", changefreq: "daily" },
      { path: "/contact", priority: "0.7", changefreq: "monthly" },
    ];

    const products = await Product.find({ active: { $ne: false } }).select("_id updatedAt").lean();
    let blogs = [];
    try {
      blogs = await Blog.find({ published: { $ne: false } }).select("_id updatedAt").lean();
    } catch {
      blogs = [];
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const route of staticRoutes) {
      xml += "  <url>\n";
      xml += `    <loc>${origin}${route.path ? route.path : "/"}</loc>\n`;
      xml += `    <lastmod>${nowStr}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += "  </url>\n";
    }

    for (const p of products) {
      const lastMod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : nowStr;
      xml += "  <url>\n";
      xml += `    <loc>${origin}/product/${p._id}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += "    <changefreq>weekly</changefreq>\n";
      xml += "    <priority>0.8</priority>\n";
      xml += "  </url>\n";
    }

    for (const b of blogs) {
      const lastMod = b.updatedAt ? new Date(b.updatedAt).toISOString().split("T")[0] : nowStr;
      xml += "  <url>\n";
      xml += `    <loc>${origin}/blogs/${b._id}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += "    <changefreq>weekly</changefreq>\n";
      xml += "    <priority>0.7</priority>\n";
      xml += "  </url>\n";
    }

    xml += "</urlset>";

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.header("Cache-Control", "public, max-age=3600, s-maxage=14400");
    return res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return res.status(500).send("Error generating sitemap");
  }
};

module.exports = { getSitemap };
