# Landing-page redesign previews (s134)

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
only, single primary CTA ("Kostenlos starten") repeated consistently.
