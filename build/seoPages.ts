import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { SITE_URL, SITE_NAME, TOOLS } from '../src/config/tools.ts';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const setMeta = (html: string, re: RegExp, value: string) => html.replace(re, (_m, pre: string) => `${pre}${esc(value)}"`);

/**
 * Emits one static HTML page per tool (dist/<tool-id>.html) with unique
 * title/description/canonical so crawlers index every tool, plus sitemap.xml
 * and robots.txt. Vercel `cleanUrls` serves /<tool-id> from <tool-id>.html.
 */
export function seoPages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'isalin-seo-pages',
    apply: 'build',
    configResolved(cfg) {
      outDir = path.resolve(cfg.root, cfg.build.outDir);
    },
    closeBundle() {
      const base = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
      const today = new Date().toISOString().slice(0, 10);

      for (const tool of TOOLS) {
        const url = `${SITE_URL}/${tool.id}`;
        const title = `${tool.title} — ${SITE_NAME}: Isalin ang lahat. Convert anything.`;
        const desc = `${tool.title}: ${tool.shortDesc}. Free, 100% private in-browser tool — no uploads.`;
        let html = base.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
        html = setMeta(html, /(<meta name="description" content=")[^"]*"/, desc);
        html = setMeta(html, /(<link rel="canonical" href=")[^"]*"/, url);
        html = setMeta(html, /(<meta property="og:url" content=")[^"]*"/, url);
        html = setMeta(html, /(<meta property="og:title" content=")[^"]*"/, title);
        html = setMeta(html, /(<meta property="og:description" content=")[^"]*"/, desc);
        html = setMeta(html, /(<meta name="twitter:title" content=")[^"]*"/, title);
        html = setMeta(html, /(<meta name="twitter:description" content=")[^"]*"/, desc);
        html = html.replace(`"url": "${SITE_URL}"`, `"url": "${url}"`);
        // Crawlable fallback content; React replaces it on mount.
        html = html.replace(
          '<div id="root"></div>',
          `<div id="root"><main><h1>${esc(tool.title)}</h1><p>${esc(tool.shortDesc)}</p><a href="/">${SITE_NAME} — all tools</a></main></div>`
        );
        fs.writeFileSync(path.join(outDir, `${tool.id}.html`), html);
      }

      const urls = [`${SITE_URL}/`, ...TOOLS.map((t) => `${SITE_URL}/${t.id}`)];
      const sitemap =
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
        '\n</urlset>\n';
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
      fs.writeFileSync(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    },
  };
}
