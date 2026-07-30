/**
 * Build the vendored German VERB morphology subset behind `src/data/verbForms.ts`
 * (Partizip II, Präteritum, separability, zu-infinitive).
 *
 * Source of truth: the `german-verbs-dict` npm package (MIT), whose data derives
 * from `german-pos-dict` by the LanguageTool project
 * (https://github.com/languagetool-org/german-pos-dict, CC-BY-SA-4.0). Same
 * upstream family as the noun oracle in `build-dict-subset.mjs`, one part of
 * speech over. Inflected forms are facts, not copyrightable; attribution is
 * recorded anyway because the upstream is CC-BY-SA.
 *
 *   pnpm build:verbs-subset      # regenerate scripts/vendor/german-verbs-subset.json
 *   pnpm build:verb-forms        # then regenerate src/data/verbForms.ts from it
 *
 * IMPORTANT, and the reason this is an oracle rather than hand-authored content:
 * a wrong Partizip II teaches a learner an error they will repeat for years. No
 * form in `verbForms.ts` is asserted by us; every one is read out of this subset.
 * Verbs the upstream does not cover simply get no entry (the surface then shows
 * nothing rather than a guess), and `pnpm lint:content` reports the shortfall.
 *
 * LOOKUP, in order, because our headwords are not always bare infinitives:
 *   1. the headword itself ("verschieben")
 *   2. minus a reflexive "sich" ("sich abstimmen" -> "abstimmen")
 *   3. minus a trailing governed preposition ("teilnehmen an" -> "teilnehmen")
 *   4. the base verb of a separable compound, re-prefixed ("herunterladen" ->
 *      "laden" -> heruntergeladen). Only applied for a known particle list, and
 *      only when the base verb is itself in the dictionary.
 * Rule 4 is the only inference, and it is the standard German particle rule
 * (the particle sits in front of the base verb's own participle), so it stays
 * inside "derived from the oracle" rather than "invented here".
 */
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "scripts", "vendor", "german-verbs-subset.json");
const REGISTRY = "https://registry.npmjs.org";
const PKG = "german-verbs-dict";

const UPSTREAM = {
  package: `${PKG} (npm, MIT)`,
  derived_from: "german-pos-dict by LanguageTool (CC-BY-SA-4.0)",
  derived_from_url: "https://github.com/languagetool-org/german-pos-dict",
  note: "Verb morphology (Partizip II, Präteritum, separability) used as a build-time oracle for src/data/verbForms.ts.",
};

/** Separable particles, longest first so "herunter" wins over "her". */
export const PARTICLES = [
  "herunter", "hinunter", "zusammen", "auseinander", "gegenüber", "entgegen",
  "zurecht", "zurück", "voraus", "vorbei", "hinein", "heraus", "herein", "hinaus",
  "weiter", "wieder", "nieder", "hinter", "durch", "unter", "über", "vorer",
  "aufrecht", "fest", "statt", "teil", "frei", "hoch", "nach", "voll", "vor", "zu",
  "leid", "ab", "an", "auf", "aus", "bei", "ein", "her", "hin", "los", "mit", "um", "zer",
];

/** Unstressed prefixes that block the ge- of the Partizip II (verkauft, bestellt,
 *  erledigt, entschieden). Used only by the weak-verb fallback below. */
const NO_GE_PREFIXES = ["ver", "be", "er", "ent", "emp", "zer", "miss", "ge"];

/** Governed prepositions that may trail a headword ("teilnehmen an"). */
export const TRAILING_PREPS = [
  "an", "auf", "aus", "bei", "für", "gegen", "in", "mit", "nach", "über", "um",
  "unter", "von", "vor", "zu",
];

/** Our headword -> the lemma keys to try, in priority order. */
export function lemmaCandidates(de) {
  const raw = String(de ?? "").trim();
  const out = [];
  const push = (s) => {
    const t = s?.trim();
    if (t && !out.includes(t)) out.push(t);
  };
  push(raw);
  const noRefl = raw.replace(/^sich\s+/i, "").trim();
  push(noRefl);
  const words = noRefl.split(/\s+/);
  if (words.length > 1 && TRAILING_PREPS.includes(words[words.length - 1].toLowerCase()))
    push(words.slice(0, -1).join(" "));
  return out;
}

/** Split a separable compound into [particle, baseVerb], or null. */
export function splitParticle(lemma) {
  for (const p of PARTICLES) {
    if (!lemma.startsWith(p)) continue;
    const base = lemma.slice(p.length);
    // A base verb needs real substance ("anen" is not a verb), but "tun" is a real
    // 3-letter infinitive, which the /tun$/ alternative below already anticipated.
    if (base.length >= 3 && /en$|ern$|eln$|tun$/.test(base)) return [p, base];
  }
  return null;
}

/** Third person singular of a tense block, joined for a separable verb
 *  (["stimmte","ab"] -> "stimmte ab"). */
function thirdSing(block) {
  const v = block?.S?.["3"];
  if (!v) return null;
  return Array.isArray(v) ? v.filter(Boolean).join(" ") : String(v);
}

/**
 * Drop pre-1996 ß spellings and the upstream's occasional malformed strong
 * variant of a weak verb ("vorberitten" alongside "vorbereitet"): when the
 * Präteritum is weak (ends -te), the participle ends in -t, so an -en variant is
 * not a real alternative. Order is preserved; the first survivor is preferred.
 */
export function cleanParticiples(pa2, praeteritum) {
  let list = (Array.isArray(pa2) ? pa2 : [pa2]).filter(Boolean).map(String);
  const noSharp = list.filter((f) => !f.includes("ß"));
  if (noSharp.length) list = noSharp;
  if (list.length > 1 && praeteritum && /te$/.test(praeteritum.split(" ")[0])) {
    const weak = list.filter((f) => /t$/.test(f));
    if (weak.length) list = weak;
  }
  return list;
}

function extractFromTar(buf, wantSuffix) {
  let off = 0;
  while (off + 512 <= buf.length) {
    const name = buf.toString("utf8", off, off + 100).replace(/\0.*$/, "");
    if (!name) break;
    const size = parseInt(buf.toString("utf8", off + 124, off + 136).replace(/[\0 ]/g, ""), 8) || 0;
    const dataStart = off + 512;
    if (name.endsWith(wantSuffix)) return buf.subarray(dataStart, dataStart + size);
    off = dataStart + Math.ceil(size / 512) * 512;
  }
  return null;
}

async function fetchBuffer(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function loadVerbs() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const mod = await server.ssrLoadModule("/src/data/vocabulary.ts");
    // browsable, not the full bank: a retired entry is off every word surface, so
    // it needs no forms and must not pad the not-covered list.
    return mod.browsableVocabulary.filter((v) => v.pos === "verb");
  } finally {
    await server.close();
  }
}

/** Resolve one headword against the upstream dictionary. Returns the raw entry
 *  plus how it was found, or null. Exported for the verify script. */
export function resolveVerb(dict, de) {
  // The upstream carries EMPTY STUBS for some compounds (`aufrechterhalten` is
  // `{}`), so presence alone is not usable: an entry counts only if it actually
  // has a Partizip II. Without this the stub short-circuits the particle rule
  // below and the verb ends up uncovered.
  const usable = (lemma) => {
    const e = dict[lemma];
    return e && (Array.isArray(e.PA2) ? e.PA2.length : Boolean(e.PA2)) ? e : null;
  };
  for (const lemma of lemmaCandidates(de)) {
    const entry = usable(lemma);
    if (entry) return { entry, lemma, particle: null, via: "direct" };
  }
  for (const lemma of lemmaCandidates(de)) {
    const split = splitParticle(lemma);
    if (!split) continue;
    const [particle, base] = split;
    const entry = usable(base);
    if (entry) return { entry, lemma: base, particle, via: "particle+base" };
  }
  return null;
}

/**
 * Last-resort WEAK-verb derivation for lemmas the upstream does not carry
 * (`vereinbaren`, `priorisieren`, `kommissionieren`, `kalibrieren` …).
 *
 * Why this is safe enough to ship, and why it is still marked `derived`: German
 * strong verbs are a CLOSED class of roughly 200 members, all of them common,
 * and every one of them is in an 8,400-entry dictionary. So a verb the oracle
 * misses is a rare, technical or borrowed verb, which is weak by construction.
 * The weak paradigm is fully regular: Partizip II = (ge)+stem+t, Präteritum =
 * stem+te, with the ge- dropped after an unstressed prefix and after -ieren.
 *
 * Anything that does not fit the pattern cleanly returns null and stays
 * uncovered, because a missing form (the surface shows nothing) is better than a
 * wrong one. Entries produced here carry `derived: true` so `verify:verbs` counts
 * them separately and the founder review queue can see they are rule-made, not
 * attested.
 */
export function deriveWeakForms(de) {
  const lemma = lemmaCandidates(de).pop();
  if (!lemma || lemma.includes(" ") || !/en$/.test(lemma)) return null;
  const stem = lemma.replace(/en$/, "");
  if (stem.length < 3) return null;
  const isIeren = /ier$/.test(stem);
  const hasNoGePrefix = NO_GE_PREFIXES.some((p) => stem.startsWith(p) && stem.length > p.length + 2);
  const particle = splitParticle(lemma);
  // A separable weak verb needs the ge- INSIDE (an+ge+meldet); handled by the
  // particle branch of resolveVerb when the base is known. If we got here the
  // base was unknown too, so decline rather than guess where the ge- goes.
  if (particle) return null;
  // -t/-d/-ln stems insert an e (erwartet, geschlichtet); consonant clusters too.
  const needsE = /[td]$/.test(stem) || /[^aeiouäöü][mn]$/.test(stem);
  const t = needsE ? "et" : "t";
  const ge = isIeren || hasNoGePrefix ? "" : "ge";
  return {
    partizip2: `${ge}${stem}${t}`,
    praeteritum: `${stem}${needsE ? "ete" : "te"}`,
    separable: false,
    zuInfinitiv: `zu ${lemma}`,
    derived: true,
  };
}

/**
 * Is the participle a SEPARABLE one? The reliable diagnostic is an internal ge-:
 * `teilgenommen` and `angemeldet` split (particle + ge…), while `unterschrieben`
 * and `verstanden` do not. This matters because `hasPrefix` is not always set
 * upstream (`teilnehmen` comes back without it), and it is the safe version of
 * "the lemma starts with a particle": `unterschreiben` starts with `unter` yet is
 * inseparable, and its participle correctly has no internal ge-.
 * Returns the particle when separable, else null.
 */
export function separableParticle(partizip2) {
  if (!partizip2) return null;
  for (const p of PARTICLES) {
    if (partizip2.startsWith(p) && partizip2.slice(p.length).startsWith("ge")) return p;
  }
  return null;
}

/** Post-1996 spelling, decided by evidence rather than by vowel-length rules: if
 *  the participle of the same stem is spelled `ss` then the stem vowel is short,
 *  so the Präteritum cannot keep `ß` (`faßte` + `zusammengefasst` -> `fasste`).
 *  A stem that keeps `ß` in both forms (grüßte / gegrüßt) is left alone. */
function alignSharpS(form, partizip2) {
  if (!form || !form.includes("ß") || !partizip2 || partizip2.includes("ß")) return form;
  return form.replace(/ß/g, "ss");
}

/** Shape one upstream entry into the fields the app needs. */
export function shapeForms(found) {
  const { entry, particle } = found;
  const prefix = (form) => (particle ? `${particle}${form}` : form);
  const praeteritumRaw = thirdSing(entry.PRT);
  const participles = cleanParticiples(entry.PA2, praeteritumRaw).map((f) =>
    particle ? prefix(f) : f,
  );
  const partizip2 = participles[0] ?? null;
  if (!partizip2) return { partizip2: null };

  // Three ways to learn the particle, in order of reliability: we prefixed it
  // ourselves; the internal ge- proves it; or the oracle asserted `hasPrefix` and
  // we split the lemma. The third is needed for `vorbereiten`, which IS separable
  // ("er bereitet vor") but whose participle carries no internal ge- because
  // `bereiten` already starts with an unstressed prefix (vorbereitet).
  const detectedParticle =
    particle ??
    separableParticle(partizip2) ??
    (entry.hasPrefix ? (splitParticle(found.lemma)?.[0] ?? null) : null);
  const separable = Boolean(entry.hasPrefix) || Boolean(detectedParticle);

  let praeteritum = praeteritumRaw;
  let praeteritumDerived = false;
  if (praeteritum && particle) {
    // We re-prefixed a base verb ourselves: the citation form a learner needs is
    // the split one ("lud herunter"), never "herunterlud".
    praeteritum = `${praeteritum.split(" ")[0]} ${particle}`;
  } else if (praeteritum && separable && detectedParticle && !praeteritum.includes(" ")) {
    // Upstream gave the fused form for a separable verb ("teilnahm"). German puts
    // the particle at the end of the clause: "nahm teil".
    const rest = praeteritum.slice(detectedParticle.length);
    if (rest.length >= 3) praeteritum = `${rest} ${detectedParticle}`;
  }
  praeteritum = alignSharpS(praeteritum, partizip2);

  // Consistency gate. A weak participle (-t) cannot pair with a strong Präteritum:
  // upstream ships a corrupt strong variant for the `bereiten` family, which made
  // `vorbereiten` come out as "beritt vor" instead of "bereitete vor". When the
  // participle proves the verb is weak, rebuild the Präteritum by the weak rule
  // (the same rule `deriveWeakForms` uses) and mark it as derived.
  const weakParticiple = /t$/.test(partizip2) && !/en$/.test(partizip2);
  const weakPraeteritum = praeteritum ? /te$/.test(praeteritum.split(" ")[0]) : false;
  if (praeteritum && weakParticiple && !weakPraeteritum) {
    const lemma = found.lemma;
    const stem = lemma.replace(/en$/, "");
    const needsE = /[td]$/.test(stem);
    const built = `${stem}${needsE ? "ete" : "te"}`;
    praeteritum = detectedParticle && !particle
      ? `${built.slice(detectedParticle.length)} ${detectedParticle}`
      : particle
        ? `${built} ${particle}`
        : built;
    praeteritumDerived = true;
  }

  return {
    partizip2,
    partizip2Variants: participles.length > 1 ? participles : undefined,
    praeteritum: praeteritum ?? null,
    praeteritumDerived: praeteritumDerived || undefined,
    separable,
    zuInfinitiv: entry.EIZ ? (particle ? prefix(entry.EIZ) : entry.EIZ) : null,
  };
}

async function main() {
  console.log(`Resolving ${PKG} from the npm registry …`);
  const meta = JSON.parse((await fetchBuffer(`${REGISTRY}/${PKG}`)).toString("utf8"));
  const version = meta["dist-tags"].latest;
  console.log(`  ${PKG}@${version}`);

  console.log("Downloading and extracting dist/verbs.json …");
  const tgz = await fetchBuffer(meta.versions[version].dist.tarball);
  const raw = extractFromTar(zlib.gunzipSync(tgz), "dist/verbs.json");
  if (!raw) throw new Error("could not find dist/verbs.json inside the tarball");
  const dict = JSON.parse(raw.toString("utf8"));
  console.log(`  upstream dictionary: ${Object.keys(dict).length} verbs`);

  console.log("Loading Genauly verb headwords …");
  const verbs = await loadVerbs();
  const subset = {};
  const missing = [];
  const derived = [];
  let viaParticle = 0;
  for (const v of verbs) {
    const found = resolveVerb(dict, v.de);
    const forms = found ? shapeForms(found) : null;
    if (forms?.partizip2) {
      if (found.via === "particle+base") viaParticle++;
      subset[v.id] = { de: v.de, lemma: found.lemma, via: found.via, ...forms };
      continue;
    }
    const fallback = deriveWeakForms(v.de);
    if (fallback) {
      derived.push(v.de);
      subset[v.id] = { de: v.de, lemma: lemmaCandidates(v.de).pop(), via: "weak-rule", ...fallback };
      continue;
    }
    missing.push(v.de);
  }
  const hit = Object.keys(subset).length;
  const attested = hit - derived.length;
  console.log(
    `  ${hit}/${verbs.length} verbs covered: ${attested} attested by the dictionary (${viaParticle} via the particle rule), ${derived.length} by the weak-verb rule; ${missing.length} not covered`,
  );
  if (derived.length) console.log(`  weak-rule derived: ${derived.join(", ")}`);
  if (missing.length) console.log(`  not covered: ${missing.join(", ")}`);

  const payload = {
    _meta: {
      generated_by: "scripts/build-verbs-subset.mjs",
      upstream: UPSTREAM,
      upstream_version: version,
      verb_count: hit,
      attested_count: attested,
      derived_count: derived.length,
      derived: derived,
      not_covered: missing,
    },
    verbs: subset,
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload, null, 0) + "\n", "utf8");
  console.log(`\n✔ Wrote ${path.relative(root, OUT)}  (${hit} verbs)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("build-verbs-subset failed:", err?.message ?? err);
    process.exitCode = 1;
  });
}
