# Landing-page redesign previews (s136)

Two self-contained mockups for a conversion-focused landing rework. Open in any browser;
no build step. Both are pure HTML/CSS, brand tokens copied from `src/index.css` /
`brand-kit/`, logo + Wesen creature geometry copied verbatim from the shipped sources
(`scripts/branding/build-logo-assets.mjs`, `src/components/artikel/Wesen.tsx`).

## Why redesign (analysis of the live page, `src/features/landing/LandingPage.tsx`)

1. **No product anywhere.** The page never shows the app: no screenshot, no mockup, no
   demo. Visitors must convert on words alone; that is the single biggest conversion gap.
2. **No proof.** Zero trust signals, although honest ones exist: 1.623 words / 1.033
   collocations / 117 grammar drills, an open provenance register, exam alignment, GDPR
   posture. (No fake testimonials or user counts were added in the previews; every number
   shown is a real content count.)
3. **Flat visual hierarchy.** Six identical icon cards + three identical step cards; the
   only visual moment is one gradient word. The brand's own creative assets (highlighter
   swipe, der/die/das Wesen, doodles, city map, Neuland) are absent.
4. **Competing CTAs.** Hero shows "Kostenlos testen" and "I already have an account" at
   equal weight; nav CTA says "Kostenlos starten" (inconsistent label).
5. **Momentum killer.** The "Was ist Genauly?" text block (kept for OAuth review) sits
   directly under the hero as a wall of prose.
6. **No pain narrative.** The plateau is named but never dramatized; nothing shows the
   learner where they are and what changes.
7. Copy nits: "a Arztbesuch" (grammar), "comfy" (tone).

Both previews fix 1 to 6 the same way (product mockups, honest proof, one primary CTA,
pain-point section, brand devices everywhere) and differ in art direction.

## Preview A: "Der Textmarker" (`landing-a-textmarker.html`)

Warm editorial notebook. The logo's Himmelblau highlighter swipe becomes the page-wide
device (headline swipes, annotated chart), plus hand-drawn doodles, a floating flashcard
collage with the real Wesen creatures, a scrolling strip of real-life scenarios, a
learning-curve "Du bist hier" chart, and a bento feature grid. Feels handmade, warm,
close to the current app aesthetic. Lower implementation risk.

## Preview B: "Die Nachtstadt" (`landing-b-nachtstadt.html`)

Cinematic product-led night city: Nachtblau taken literally. Dark hero with the six
domain buildings (windows lit white, per the founder rule: no reward color on buildings),
a phone mockup of the Heute screen center stage, floating proof chips, then a warm Papier
body with three product splits (session player, Neuland missions, word constellation) and
a data-quality band. Closing echo: "Die Stadt wird hell, wenn du übst." Feels bigger and
more premium; more implementation work (hero art + mockups as components).

Copy in both follows the house rules: no em dashes, Denglish brand voice, honest numbers
only, single primary CTA repeated consistently.

## Revision 2 (founder feedback, s136): Preview A chosen

Preview A updated per founder direction: (1) logo optically centered against the wordmark
(viewBox cropped to the artwork bounds, `7 12 52 52`); (2) nav gained real page links
(About `/about`, Help `/hilfe`, Sources `/sources`, plus footer Privacy/Terms); (3) a new
dedicated section "Filter what you need. Practice exactly that." with a filter-rail mockup
(Thema/Stufe/Wortart/Branche + the Üben footer button) selling the faceted library and
custom scoped Üben sessions; (4) copy rewritten English-first, German kept only for
obvious/brand terms (der/die/das, Behörde, Üben, exam names, the app-UI mocks and the
scenario chips, roughly 10-20%); (5) a working EN/DE toggle in the nav (mirrors the
bilingual pattern of /about, /hilfe and the legal pages): the script at the bottom of the
file snapshots the English innerHTML and swaps in the full German dictionary, so the
whole page is previewable in both languages.

## Revision 3 (founder feedback, s136)

- The steps headline "Three steps. No textbook." was replaced with "Three steps. Your
  smart companion." (DE: "Dein smarter Begleiter."): Genauly is a companion to
  traditional learning, never a claimed replacement. Avoid replacement claims in all
  future landing copy.
- **Implementation spec (not visible in the logged-out preview):** when the visitor is
  already onboarded/logged in, every primary CTA (nav, hero, closing) reads **"Go to
  app"** (DE: **"Zur App"**) and routes to `/`, replacing the live page's "Zum
  Dashboard" label.
