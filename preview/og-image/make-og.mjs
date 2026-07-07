// Generator for the Open Graph share image (public/og-image.png, 1200x630).
// The repo has no headless-render dependency, so this writes a self-contained
// HTML card (brand logo embedded as a data URI) that you screenshot with the
// pre-installed Chromium. Run from the repo root:
//
//   node preview/og-image/make-og.mjs /tmp/og.html
//   <chromium> --headless=new --no-sandbox --hide-scrollbars \
//     --window-size=1200,630 --screenshot=public/og-image.png file:///tmp/og.html
//
// (Chromium lives at $PLAYWRIGHT_BROWSERS_PATH/chromium-*/chrome-linux/chrome
// in the web sandbox.) Re-run after a brand/tagline change. No em dashes (CLAUDE.md).
import { readFileSync, writeFileSync } from "node:fs";

// Embed the brand logo as a data URI so the headless-Chrome screenshot needs no
// file-access flags.
const logo = readFileSync("public/genauly-default-logo-transparent-corners.png").toString("base64");
const logoUri = `data:image/png;base64,${logo}`;

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #e2e8f0;
    background:
      radial-gradient(1000px 520px at 50% -180px, rgba(91,91,230,0.42), transparent 70%),
      radial-gradient(700px 500px at 100% 120%, rgba(129,140,248,0.18), transparent 70%),
      #0f1729;
    width: 1200px; height: 630px;
    position: relative; overflow: hidden;
    display: flex; flex-direction: column;
    padding: 58px 76px 52px;
  }
  .brandrow { display: flex; align-items: center; gap: 18px; }
  .brandrow img { width: 68px; height: 68px; border-radius: 16px; box-shadow: 0 8px 40px rgba(91,91,230,0.5); }
  .brandname { font-size: 36px; font-weight: 700; letter-spacing: -0.5px; }
  .brandsub { font-size: 19px; color: #a5b4fc; font-weight: 600; margin-top: 2px; }
  .center { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  h1 { font-size: 74px; font-weight: 800; letter-spacing: -2px; line-height: 1.04; }
  .grad {
    background: linear-gradient(100deg, #a5b4fc, #6366f1 55%, #818cf8);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .sub { font-size: 31px; color: #cbd5e1; font-weight: 600; margin-top: 20px; }
  .pills { display: flex; gap: 13px; margin-top: 34px; flex-wrap: wrap; }
  .pill {
    font-size: 21px; font-weight: 600; color: #cbd5e1;
    background: rgba(148,163,184,0.12); border: 1px solid rgba(148,163,184,0.22);
    border-radius: 999px; padding: 9px 20px;
  }
  .foot { margin-top: 36px; display: flex; align-items: center; gap: 16px; }
  .url { font-size: 25px; font-weight: 700; color: #e2e8f0; }
  .dot { color: #475569; font-size: 25px; }
  .tag { font-size: 22px; color: #94a3b8; font-weight: 500; }
</style>
</head>
<body>
  <div class="brandrow">
    <img src="${logoUri}" alt="" />
    <div>
      <div class="brandname">Genauly</div>
      <div class="brandsub">German for real life · B1–B2</div>
    </div>
  </div>

  <div class="center">
    <h1>Break through<br/>the <span class="grad">B1–B2 plateau.</span></h1>
    <div class="sub">German for the situations that actually matter.</div>
    <div class="pills">
      <span class="pill">Arbeit</span>
      <span class="pill">Behörde</span>
      <span class="pill">Arzt</span>
      <span class="pill">Wohnen &amp; Bank</span>
      <span class="pill">telc B2 Beruf · Goethe B2</span>
    </div>
    <div class="foot">
      <div class="url">genauly.de</div>
      <div class="dot">·</div>
      <div class="tag">Practise. Speak. Get AI feedback.</div>
    </div>
  </div>
</body>
</html>`;

writeFileSync(process.argv[2], html);
console.log("wrote", process.argv[2]);
