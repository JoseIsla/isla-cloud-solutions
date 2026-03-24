const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.islacloudsolutions.com';
const API_URL = process.env.VITE_API_URL || 'https://api.islacloudsolutions.com';
const today = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/servicios', priority: '0.9', changefreq: 'weekly' },
  { path: '/sobre-nosotros', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/contacto', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacidad', priority: '0.3', changefreq: 'yearly' },
  { path: '/legal', priority: '0.3', changefreq: 'yearly' },
];

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
  } catch {
    console.warn(`⚠️  No se pudo conectar a ${url}, se generará sitemap solo con rutas estáticas.`);
    return [];
  }
}

function buildUrl(loc, priority, changefreq, lastmod) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generate() {
  const urls = staticRoutes.map((r) => buildUrl(r.path, r.priority, r.changefreq));

  // Dynamic: services
  const services = await fetchJSON(`${API_URL}/api/services`);
  for (const s of services) {
    if (s.is_active && s.slug) {
      urls.push(buildUrl(`/servicios/${s.slug}`, '0.8', 'monthly'));
    }
  }

  // Dynamic: blog posts
  const news = await fetchJSON(`${API_URL}/api/news`);
  for (const n of news) {
    if (n.is_published && n.slug) {
      const lastmod = n.published_at ? n.published_at.split('T')[0] : today;
      urls.push(buildUrl(`/blog/${n.slug}`, '0.7', 'monthly', lastmod));
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const outDir = path.resolve(__dirname, '..', 'dist');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf-8');
  console.log(`✅ sitemap.xml generado con ${urls.length} URLs`);
}

generate();