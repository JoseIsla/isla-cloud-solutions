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
  { path: '/casos', priority: '0.8', changefreq: 'weekly' },
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

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function buildUrl(loc, priority, changefreq, lastmod) {
  return `  <url>
    <loc>${escapeXml(SITE_URL + loc)}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generate() {
  const urls = staticRoutes.map((r) => buildUrl(r.path, r.priority, r.changefreq));

  // Dynamic: services (only active)
  const services = await fetchJSON(`${API_URL}/api/services`);
  for (const s of services) {
    if (s.is_active && s.slug) {
      const lastmod = s.updated_at ? s.updated_at.split('T')[0] : today;
      urls.push(buildUrl(`/servicios/${s.slug}`, '0.8', 'monthly', lastmod));
    }
  }

  // Dynamic: blog posts (only published, exclude noindex)
  const news = await fetchJSON(`${API_URL}/api/news`);
  for (const n of news) {
    if (n.is_published && n.slug && !n.noindex) {
      const lastmod = n.updated_at ? n.updated_at.split('T')[0] : (n.published_at ? n.published_at.split('T')[0] : today);
      urls.push(buildUrl(`/blog/${n.slug}`, '0.7', 'monthly', lastmod));
    }
  }

  // Dynamic: cases (only active, exclude noindex)
  const cases = await fetchJSON(`${API_URL}/api/cases`);
  for (const c of cases) {
    if (c.is_active && !c.noindex) {
      const lastmod = c.updated_at ? c.updated_at.split('T')[0] : (c.created_at ? c.created_at.split('T')[0] : today);
      urls.push(buildUrl(`/casos/${c.slug || c.id}`, '0.7', 'monthly', lastmod));
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
