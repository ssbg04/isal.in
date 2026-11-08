# Engineering Skill: SEO & Product Trust

## Purpose
Governs search engine optimization, crawlability for headless bots, meta tags, schema markup, and user trust transparency.

## When to Activate
Activate during audits of HTML metadata, URL routing, sitemaps, robots configuration, or static prerendering.

## Required Context
- Google Search Central guidelines.
- Schema.org WebApplication structured data specs.
- `index.html`, `public/robots.txt`, and `public/sitemap.xml`.

## Methodology & Engineering Standards
1. **Clean URL Architecture**:
   - Every tool must have a clean, discoverable URL path (e.g. `/image-convert`, `/income-tax-ph`).
   - Legacy hash fragments (`#image-convert`) must seamlessly migrate to clean paths via `window.history.replaceState`.

2. **Crawler-Accessible Static Fallback**:
   - SPAs must provide semantic HTML markup in raw server responses so search crawlers and AdSense reviewers that do not run JavaScript can inspect the application's true purpose.
   - Maintain standalone static HTML pages for `/privacy`, `/terms`, `/about`, and `/contact`.

3. **Metadata & Open Graph**:
   - Provide distinct `title`, `meta description`, `canonical` link, and `og:image` tags.
   - Synchronize document title and description dynamically as users navigate between tools.

4. **Structured Data**:
   - Embed JSON-LD schema (`WebApplication`) detailing supported features, pricing (Free/0), and operating system compatibility.

## Verification Checklist
- [ ] Sitemap lists all canonical tool URLs and matches `robots.txt`.
- [ ] Clean URLs resolve without 404s or redirect loops.
- [ ] Rich structured data validates cleanly against Schema.org validators.
