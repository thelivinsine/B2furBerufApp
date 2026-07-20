/**
 * Build-time prerender for the public help section (/hilfe).
 *
 * Genauly is a client-rendered SPA on GitHub Pages, so a normal build ships one
 * index.html whose <title>/description/canonical are the same on every route.
 * That is fine for the app shell but weak for SEO: only Google reliably renders
 * JavaScript, and social/link-preview crawlers never do. To make the help
 * articles genuinely indexable, this postbuild step emits a REAL static HTML
 * file per help page into dist/hilfe/..., each with:
 *   - a unique <title>, meta description, and canonical URL,
 *   - Open Graph / Twitter tags,
 *   - Article + BreadcrumbList (+ FAQPage) JSON-LD,
 *   - the full article text baked into #root as semantic HTML,
 * while still loading the same hashed app bundle, so real (JS) users get the
 * interactive SPA the moment it boots (it clears #root on mount).
 *
 * The content comes from the SAME bank the React reader uses
 * (src/features/help/content.ts), loaded through Vite's ssrLoadModule so there
 * is no second source of truth. The script also regenerates dist/sitemap.xml to
 * include the new help URLs.
 *
 * Runs automatically after `pnpm build` via the "postbuild" npm script.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ORIGIN = "https://genauly.de";

/* ---------------------------------------------------------------- helpers */

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Serialize one article body block to semantic HTML (mirrors HelpBlocks). */
function blockToHtml(b, lang) {
  switch (b.type) {
    case "h2":
      return `<h2>${esc(b[lang])}</h2>`;
    case "h3":
      return `<h3>${esc(b[lang])}</h3>`;
    case "p":
      return `<p>${esc(b[lang])}</p>`;
    case "note":
      return `<aside class="note">${esc(b[lang])}</aside>`;
    case "ul":
      return `<ul>${b[lang].map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`;
    case "steps":
      return `<ol>${b[lang].map((li) => `<li>${esc(li)}</li>`).join("")}</ol>`;
    default:
      return "";
  }
}

/** Minimal inline-styled, dark-theme static snapshot shown to no-JS clients
 *  (crawlers, social previews). Real users never see it: React clears #root. */
function staticShell({ title, updated, breadcrumbHtml, bodyHtml }) {
  return `<main style="min-height:100vh;background:#131620;color:#e7e8ef;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:44rem;margin:0 auto;padding:2rem 1.25rem 4rem;">
    <a href="${ORIGIN}/" style="display:inline-flex;align-items:center;gap:.6rem;color:#e7e8ef;text-decoration:none;margin-bottom:1.5rem;">
      <img src="/genauly-wordmark-dark.png" alt="Genauly" width="127" height="32" style="display:block;" />
    </a>
    ${breadcrumbHtml}
    <h1 style="font-size:1.9rem;font-weight:700;line-height:1.2;margin:.25rem 0 .5rem;">${esc(title)}</h1>
    ${updated ? `<p style="color:#a5a2b5;font-size:.85rem;margin:0 0 1.5rem;">Zuletzt aktualisiert: ${esc(updated)}</p>` : ""}
    <div class="help-body" style="font-size:1rem;line-height:1.7;color:#c6c3d4;">
      ${bodyHtml}
    </div>
    <p style="margin-top:2.5rem;font-size:.9rem;color:#a5a2b5;">
      <a href="${ORIGIN}/hilfe" style="color:#a5b4fc;">Alle Hilfe-Themen</a> ·
      <a href="${ORIGIN}/" style="color:#a5b4fc;">Zur App</a> ·
      <a href="${ORIGIN}/about" style="color:#a5b4fc;">Über Genauly</a>
    </p>
  </div>
</main>`;
}

/** Replace/insert a <meta name|property=...> tag's content in the head string. */
function setMeta(html, attr, name, content) {
  const re = new RegExp(`(<meta ${attr}="${name}"[^>]*content=")[^"]*(")`, "i");
  if (re.test(html)) return html.replace(re, `$1${esc(content)}$2`);
  // Insert before </head> if the tag was not present.
  return html.replace(
    "</head>",
    `    <meta ${attr}="${name}" content="${esc(content)}" />\n  </head>`,
  );
}

/** Build a full HTML document for one help page from the dist template. */
function renderPage(template, { title, description, canonical, jsonLd, staticHtml, ogType }) {
  let html = template;

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);
  // canonical
  html = html.replace(
    /<link rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${esc(canonical)}" />`,
  );
  // meta description + social tags
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", canonical);
  html = setMeta(html, "property", "og:type", ogType || "article");
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);

  // Strip the landing-page JSON-LD blocks (WebApplication + FAQPage) and inject
  // page-appropriate structured data instead.
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/gi,
    "",
  );
  const ldTag = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
  html = html.replace("</head>", `    ${ldTag}\n  </head>`);

  // Swap the #root boot content for the static article snapshot. The template
  // has <div id="root"> ... </div> followed by <script src="/spa-redirect.js">.
  const rootOpen = '<div id="root">';
  const marker = '<script src="/spa-redirect.js">';
  const start = html.indexOf(rootOpen);
  const scriptAt = html.indexOf(marker, start);
  if (start !== -1 && scriptAt !== -1) {
    const before = html.slice(0, start);
    const after = html.slice(scriptAt);
    html = `${before}${rootOpen}\n${staticHtml}\n    </div>\n    ${after}`;
  }
  return html;
}

/* ---------------------------------------------------------------- content */

async function loadContent() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    return await server.ssrLoadModule("/src/features/help/content.ts");
  } finally {
    await server.close();
  }
}

function breadcrumbHtml(items) {
  // items: [{ name, url }]
  const parts = items.map((it, i) =>
    i === items.length - 1
      ? `<span style="color:#c6c3d4;">${esc(it.name)}</span>`
      : `<a href="${esc(it.url)}" style="color:#a5b4fc;text-decoration:none;">${esc(it.name)}</a>`,
  );
  return `<nav style="font-size:.8rem;color:#64748b;margin-bottom:.5rem;">${parts.join(
    ' <span style="color:#475569;">›</span> ',
  )}</nav>`;
}

function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/* ------------------------------------------------------------------- main */

async function main() {
  const templatePath = path.join(dist, "index.html");
  let template;
  try {
    template = await fs.readFile(templatePath, "utf8");
  } catch {
    console.error(
      "[prerender-help] dist/index.html not found. Run `pnpm build` first (this is a postbuild step).",
    );
    process.exit(1);
  }

  const { helpArticles, helpHub, helpCategories } = await loadContent();
  const LANG = "de"; // prerender the German snapshot (binding/primary language)

  const written = [];

  /* ---- hub: /hilfe ---- */
  {
    const canonical = `${ORIGIN}/hilfe`;
    const crumbs = [{ name: "Genauly", url: `${ORIGIN}/` }, { name: helpHub.title[LANG], url: canonical }];

    const listHtml = ["grundlagen", "ueben", "spielen"]
      .map((cat) => {
        const items = helpArticles.filter((a) => a.category === cat);
        if (!items.length) return "";
        const links = items
          .map(
            (a) =>
              `<li><a href="${ORIGIN}/hilfe/${a.slug}" style="color:#a5b4fc;text-decoration:none;font-weight:600;">${esc(
                a.title[LANG],
              )}</a><br /><span style="color:#a5a2b5;font-size:.9rem;">${esc(a.description[LANG])}</span></li>`,
          )
          .join("");
        return `<h2>${esc(helpCategories[cat][LANG])}</h2><ul>${links}</ul>`;
      })
      .join("");

    const faqHtml = helpHub.faq
      .map((f) => `<h3>${esc(f.q[LANG])}</h3><p>${esc(f.a[LANG])}</p>`)
      .join("");

    const staticHtml = staticShell({
      title: helpHub.title[LANG],
      breadcrumbHtml: breadcrumbHtml(crumbs),
      bodyHtml: `<p>${esc(helpHub.intro[LANG])}</p>${listHtml}<h2>Häufige Fragen</h2>${faqHtml}`,
    });

    const jsonLd = [
      breadcrumbLd(crumbs),
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: helpHub.faq.map((f) => ({
          "@type": "Question",
          name: f.q[LANG],
          acceptedAnswer: { "@type": "Answer", text: f.a[LANG] },
        })),
      },
    ];

    const html = renderPage(template, {
      title: `${helpHub.title[LANG]} · Genauly`,
      description: helpHub.description[LANG],
      canonical,
      jsonLd,
      staticHtml,
      ogType: "website",
    });
    const outDir = path.join(dist, "hilfe");
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
    written.push({ url: canonical, priority: "0.7", changefreq: "monthly" });
  }

  /* ---- articles: /hilfe/:slug ---- */
  for (const a of helpArticles) {
    const canonical = `${ORIGIN}/hilfe/${a.slug}`;
    const crumbs = [
      { name: "Genauly", url: `${ORIGIN}/` },
      { name: helpHub.title[LANG], url: `${ORIGIN}/hilfe` },
      { name: a.title[LANG], url: canonical },
    ];

    const bodyHtml = [
      `<p>${esc(a.description[LANG])}</p>`,
      ...a.body.map((b) => blockToHtml(b, LANG)),
      ...(a.faq && a.faq.length
        ? [
            "<h2>Häufige Fragen</h2>",
            ...a.faq.map((f) => `<h3>${esc(f.q[LANG])}</h3><p>${esc(f.a[LANG])}</p>`),
          ]
        : []),
    ].join("");

    const staticHtml = staticShell({
      title: a.title[LANG],
      updated: a.updated,
      breadcrumbHtml: breadcrumbHtml(crumbs),
      bodyHtml,
    });

    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title[LANG],
        description: a.description[LANG],
        inLanguage: "de",
        dateModified: a.updated,
        mainEntityOfPage: canonical,
        author: { "@type": "Organization", name: "Genauly" },
        publisher: { "@type": "Organization", name: "Genauly", url: `${ORIGIN}/` },
      },
      breadcrumbLd(crumbs),
      ...(a.faq && a.faq.length
        ? [
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: a.faq.map((f) => ({
                "@type": "Question",
                name: f.q[LANG],
                acceptedAnswer: { "@type": "Answer", text: f.a[LANG] },
              })),
            },
          ]
        : []),
    ];

    const html = renderPage(template, {
      title: `${a.title[LANG]} · Genauly`,
      description: a.description[LANG],
      canonical,
      jsonLd,
      staticHtml,
      ogType: "article",
    });

    const outDir = path.join(dist, "hilfe", a.slug);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
    written.push({ url: canonical, priority: "0.6", changefreq: "monthly" });
  }

  /* ---- regenerate sitemap.xml (public marketing/legal routes + help) ---- */
  const staticRoutes = [
    { url: `${ORIGIN}/`, priority: "1.0", changefreq: "weekly" },
    { url: `${ORIGIN}/about`, priority: "0.7", changefreq: "monthly" },
    { url: `${ORIGIN}/sources`, priority: "0.4", changefreq: "monthly" },
    { url: `${ORIGIN}/privacy`, priority: "0.3", changefreq: "yearly" },
    { url: `${ORIGIN}/terms`, priority: "0.3", changefreq: "yearly" },
  ];
  const urls = [...staticRoutes, ...written]
    .map(
      (r) =>
        `  <url>\n    <loc>${r.url}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
    )
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated by scripts/prerender-help.mjs (postbuild). Public, crawlable routes only. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");

  console.log(
    `[prerender-help] wrote ${written.length} static help page(s) + sitemap.xml (${
      staticRoutes.length + written.length
    } URLs).`,
  );
}

main().catch((err) => {
  console.error("[prerender-help] failed:", err);
  process.exit(1);
});
