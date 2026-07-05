/**
 * FSRS scheduler test gate for `src/engine/srs.ts` (Learning Engine 26b).
 *
 * Replays golden review sequences through the real engine and asserts the
 * resulting stability / difficulty / interval / due date against reference
 * vectors generated from py-fsrs 6.3.1, the open-spaced-repetition reference
 * implementation of FSRS-6, configured to match this app's semantics:
 * `Scheduler(learning_steps=(), relearning_steps=(), enable_fuzzing=False)`
 * with the default parameters, desired_retention=0.9, maximum_interval=36500.
 * (Sanity check at generation time: the same library reproduces its own
 * published interval-history test `[0, 2, 11, 46, 163, 498, 0, 0, 2, 4, 7,
 * 12, 21]` with learning steps enabled.)
 *
 * Also covers the engine's contracts around the algorithm: the lazy legacy
 * SM-2 seed, the 26a latency capture, reps monotonicity (cloudSync merge
 * safety), the warm SM-2 ease, and the mastery() continuity for untouched
 * legacy cards.
 *
 * Loads the real `.ts` engine through Vite's `ssrLoadModule` (the
 * `lint-content.mjs` pattern). Run with `pnpm test:srs`. Any failed assertion
 * fails the process (CI gate).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ------------------------------------------------------------------ */
/* golden vectors (generated from py-fsrs 6.3.1, see header)           */
/* ------------------------------------------------------------------ */

// Each row: review on day N (offset from day 0), grade given, expected
// post-review state. Sequences review "at due" unless the offsets say
// otherwise (late/early/same-day scenarios).
const GOLDEN_SEQUENCES = {
  // The published py-fsrs happy-path grade mix, reviewed exactly at due.
  goodsAndLapses: [
    { day: 0, grade: 4, stability: 2.3065, difficulty: 2.118103970459016, interval: 2 },
    { day: 2, grade: 4, stability: 10.964332335820698, difficulty: 2.111214235785395, interval: 11 },
    { day: 13, grade: 4, stability: 46.28021728755693, difficulty: 2.1043313908464483, interval: 46 },
    { day: 59, grade: 4, stability: 162.86220163874916, difficulty: 2.0974554287524403, interval: 163 },
    { day: 222, grade: 4, stability: 497.4471936002745, difficulty: 2.0905863426205262, interval: 497 },
    { day: 719, grade: 4, stability: 1345.52877754259, difficulty: 2.083724125574744, interval: 1346 },
    { day: 2065, grade: 0, stability: 9.444601345349833, difficulty: 7.383202320049203, interval: 9 },
    { day: 2074, grade: 0, stability: 1.3126390719537793, difficulty: 9.125104766121234, interval: 1 },
    { day: 2075, grade: 4, stability: 2.3496733074806873, difficulty: 9.11120803065195, interval: 2 },
    { day: 2077, grade: 4, stability: 4.19402832707873, difficulty: 9.097325191918136, interval: 4 },
    { day: 2081, grade: 4, stability: 7.466540229825095, difficulty: 9.083456236023055, interval: 7 },
    { day: 2088, grade: 4, stability: 12.731547265598365, difficulty: 9.06960114908387, interval: 13 },
    { day: 2101, grade: 4, stability: 21.528151353185145, difficulty: 9.055759917231622, interval: 22 },
  ],
  // All four grades, at due (hard penalty, easy bonus, lapse, relearning).
  gradeMix: [
    { day: 0, grade: 4, stability: 2.3065, difficulty: 2.118103970459016, interval: 2 },
    { day: 2, grade: 3, stability: 7.513320366762569, difficulty: 4.752858488532557, interval: 8 },
    { day: 10, grade: 4, stability: 26.407944217282477, difficulty: 4.743333999340863, interval: 26 },
    { day: 36, grade: 5, stability: 121.97074076577839, difficulty: 2.9720295518530486, interval: 122 },
    { day: 158, grade: 4, stability: 358.9795295182791, difficulty: 2.964285891598034, interval: 359 },
    { day: 517, grade: 0, stability: 6.0538875919101995, difficulty: 7.672636984721049, interval: 6 },
    { day: 523, grade: 3, stability: 10.85820406762877, difficulty: 8.440216344638158, interval: 11 },
    { day: 534, grade: 4, stability: 21.016571435197324, difficulty: 8.427004497590357, interval: 21 },
  ],
  hardOnly: [
    { day: 0, grade: 3, stability: 1.2931, difficulty: 5.112170705601056, interval: 1 },
    { day: 1, grade: 3, stability: 3.2494117658571677, difficulty: 6.7404595108297, interval: 3 },
    { day: 4, grade: 3, stability: 6.728346299675288, difficulty: 7.821393497998797, interval: 7 },
    { day: 11, grade: 3, stability: 11.916432357612775, difficulty: 8.538967850205447, interval: 12 },
    { day: 23, grade: 3, stability: 18.23628830824098, difficulty: 9.015327144165033, interval: 18 },
  ],
  easyOnly: [
    { day: 0, grade: 5, stability: 8.2956, difficulty: 1.0, interval: 8 },
    { day: 8, grade: 5, stability: 65.62422616189994, difficulty: 1.0, interval: 66 },
    { day: 74, grade: 5, stability: 396.7750233497581, difficulty: 1.0, interval: 397 },
    { day: 471, grade: 5, stability: 1874.9169554074524, difficulty: 1.0, interval: 1875 },
    { day: 2346, grade: 5, stability: 7265.432894791257, difficulty: 1.0, interval: 7265 },
  ],
  // Same-day repeats take the short-term stability path (the Good repeat's
  // stability increase clamps at 1.0, the Again repeat shrinks stability).
  sameDay: [
    { day: 0, grade: 4, stability: 2.3065, difficulty: 2.118103970459016, interval: 2 },
    { day: 0, grade: 4, stability: 2.3065, difficulty: 2.111214235785395, interval: 2 },
    { day: 0, grade: 0, stability: 0.7750839828558984, difficulty: 7.392238132342694, interval: 1 },
    { day: 1, grade: 4, stability: 2.6506751734904603, difficulty: 7.38007426350719, interval: 3 },
  ],
  // Reviewed well past due: lower retrievability, bigger stability jump.
  lateReviews: [
    { day: 0, grade: 4, stability: 2.3065, difficulty: 2.118103970459016, interval: 2 },
    { day: 9, grade: 4, stability: 23.993042579260447, difficulty: 2.111214235785395, interval: 24 },
    { day: 40, grade: 4, stability: 104.81742940003576, difficulty: 2.1043313908464483, interval: 105 },
  ],
  // Reviewed the day after an 8-day interval was scheduled (retrievability
  // near 1, small stability gain), then at due.
  earlyReview: [
    { day: 0, grade: 5, stability: 8.2956, difficulty: 1.0, interval: 8 },
    { day: 1, grade: 4, stability: 13.485062611471017, difficulty: 1.0, interval: 13 },
    { day: 14, grade: 4, stability: 59.36250970125242, difficulty: 1.0, interval: 59 },
  ],
};

// Expected state after the FIRST review of a fresh card, per grade.
const GOLDEN_FIRST_RATING = {
  0: { stability: 0.212, difficulty: 6.4133, interval: 1 },
  3: { stability: 1.2931, difficulty: 5.112170705601056, interval: 1 },
  4: { stability: 2.3065, difficulty: 2.118103970459016, interval: 2 },
  5: { stability: 8.2956, difficulty: 1.0, interval: 8 },
};

// Lazy legacy-seed path: an SM-2 card (no stability/difficulty) is seeded
// with stability = max(0.5, interval) and difficulty mapped from ease, then
// reviewed as a normal FSRS card. Expected values from py-fsrs given the
// seeded memory state (last review = due - interval).
// Base legacy card: ease 2.5, interval 10, reps 3 -> seeds S=10, D=3.
const GOLDEN_LEGACY = {
  goodAtDue: { stability: 39.36897264264897, difficulty: 2.9922283692968383, interval: 39 },
  goodLate: { stability: 48.69996804960362, difficulty: 2.9922283692968383, interval: 49 },
  againAtDue: { stability: 1.4363381115806342, difficulty: 7.6843759692968385, interval: 1 },
  // Lapsed legacy card: ease 1.94, interval 1, reps 0 -> seeds S=1, D=6.2666...
  lapsedLegacyGood: { stability: 3.550150769038039, difficulty: 6.255628369296839, interval: 4 },
};

/* ------------------------------------------------------------------ */
/* tiny harness                                                        */
/* ------------------------------------------------------------------ */

let failures = 0;
let checks = 0;

function fail(name, msg) {
  failures += 1;
  console.error(`  ✗ ${name}: ${msg}`);
}

function ok(_name) {
  checks += 1;
}

function assertClose(name, actual, expected, relTol = 1e-9) {
  const tol = Math.max(Math.abs(expected), 1) * relTol;
  if (typeof actual !== "number" || Math.abs(actual - expected) > tol) {
    fail(name, `expected ${expected}, got ${actual}`);
  } else ok(name);
}

function assertEqual(name, actual, expected) {
  if (actual !== expected) fail(name, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  else ok(name);
}

function assertTrue(name, cond, msg = "condition false") {
  if (!cond) fail(name, msg);
  else ok(name);
}

/* Day arithmetic for the replay: local dates, noon (DST-safe). */
const T0 = new Date(2026, 0, 1, 12, 0, 0);
function onDay(n) {
  const d = new Date(T0);
  d.setDate(d.getDate() + n);
  return d;
}
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* run                                                                 */
/* ------------------------------------------------------------------ */

async function main() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });

  try {
    const { review, freshCard, isDue, mastery, masteryLabel, reviewWeight, dueCount } =
      await server.ssrLoadModule("/src/engine/srs.ts");

    /* ---- golden sequences ---- */
    for (const [scenario, rows] of Object.entries(GOLDEN_SEQUENCES)) {
      let card = freshCard(dateKey(T0));
      rows.forEach((row, i) => {
        const at = onDay(row.day);
        card = review(card, row.grade, at);
        const tag = `${scenario}[${i}]`;
        assertClose(`${tag}.stability`, card.stability, row.stability);
        assertClose(`${tag}.difficulty`, card.difficulty, row.difficulty);
        assertEqual(`${tag}.interval`, card.interval, row.interval);
        const due = onDay(row.day + row.interval);
        assertEqual(`${tag}.due`, card.due, dateKey(due));
        assertEqual(`${tag}.reps`, card.reps, i + 1);
      });
    }

    /* ---- first-rating table ---- */
    for (const [grade, exp] of Object.entries(GOLDEN_FIRST_RATING)) {
      const card = review(freshCard(dateKey(T0)), Number(grade), T0);
      assertClose(`firstRating[${grade}].stability`, card.stability, exp.stability);
      assertClose(`firstRating[${grade}].difficulty`, card.difficulty, exp.difficulty);
      assertEqual(`firstRating[${grade}].interval`, card.interval, exp.interval);
    }

    /* ---- lazy legacy seed ---- */
    // Legacy card: last review on day 0, interval 10, due day 10, ease 2.5.
    const legacy = { ease: 2.5, interval: 10, reps: 3, due: dateKey(onDay(10)) };
    {
      const c = review({ ...legacy }, 4, onDay(10));
      assertClose("legacy.goodAtDue.stability", c.stability, GOLDEN_LEGACY.goodAtDue.stability);
      assertClose("legacy.goodAtDue.difficulty", c.difficulty, GOLDEN_LEGACY.goodAtDue.difficulty);
      assertEqual("legacy.goodAtDue.interval", c.interval, GOLDEN_LEGACY.goodAtDue.interval);
      assertEqual("legacy.goodAtDue.reps", c.reps, 4);
    }
    {
      const c = review({ ...legacy }, 4, onDay(15)); // 5 days late
      assertClose("legacy.goodLate.stability", c.stability, GOLDEN_LEGACY.goodLate.stability);
      assertEqual("legacy.goodLate.interval", c.interval, GOLDEN_LEGACY.goodLate.interval);
    }
    {
      const c = review({ ...legacy }, 0, onDay(10));
      assertClose("legacy.againAtDue.stability", c.stability, GOLDEN_LEGACY.againAtDue.stability);
      assertClose("legacy.againAtDue.difficulty", c.difficulty, GOLDEN_LEGACY.againAtDue.difficulty);
      assertEqual("legacy.againAtDue.interval", c.interval, GOLDEN_LEGACY.againAtDue.interval);
    }
    {
      // A lapsed SM-2 card (reps reset to 0, interval 1) is a legacy card,
      // not a fresh one: it must seed, not take the first-rating path.
      const lapsed = { ease: 1.94, interval: 1, reps: 0, due: dateKey(onDay(1)) };
      const c = review(lapsed, 4, onDay(1));
      assertClose("legacy.lapsed.stability", c.stability, GOLDEN_LEGACY.lapsedLegacyGood.stability);
      assertClose("legacy.lapsed.difficulty", c.difficulty, GOLDEN_LEGACY.lapsedLegacyGood.difficulty);
      assertEqual("legacy.lapsed.interval", c.interval, GOLDEN_LEGACY.lapsedLegacyGood.interval);
    }

    /* ---- 26a latency capture regression ---- */
    {
      let c = review(freshCard(dateKey(T0)), 4, T0, 3000);
      assertEqual("latency.first.lastMs", c.lastMs, 3000);
      assertEqual("latency.first.emaMs", c.emaMs, 3000);
      c = review(c, 4, onDay(2), 1000);
      assertEqual("latency.second.lastMs", c.lastMs, 1000);
      assertEqual("latency.second.emaMs", c.emaMs, Math.round(0.3 * 1000 + 0.7 * 3000));
      const before = { lastMs: c.lastMs, emaMs: c.emaMs };
      c = review(c, 4, onDay(13));
      assertEqual("latency.absent.carriesLastMs", c.lastMs, before.lastMs);
      assertEqual("latency.absent.carriesEmaMs", c.emaMs, before.emaMs);
      c = review(c, 4, onDay(59), 120000);
      assertEqual("latency.clamp.60s", c.lastMs, 60000);
    }

    /* ---- Phase 1.5: "correct but slow" demotes Good -> Hard (self-relative) ---- */
    {
      // An established card with 3 latency samples and a ~1000ms EMA.
      let base = review(freshCard(dateKey(T0)), 4, onDay(0), 1000);
      base = review(base, 4, onDay(2), 1000);
      base = review(base, 4, onDay(20), 1000);
      assertEqual("latencyGrade.buildsMsCount", base.msCount, 3);
      assertEqual("latencyGrade.buildsEma", base.emaMs, 1000);

      const on = onDay(60);
      // Slow (5000ms > 1000*1.5 and > 2000 floor) + flag on -> graded as Hard.
      const demoted = review({ ...base }, 4, on, 5000, { latencyGrading: true });
      const hardRef = review({ ...base }, 3, on);
      assertClose("latencyGrade.demoted.stability", demoted.stability, hardRef.stability);
      assertClose("latencyGrade.demoted.difficulty", demoted.difficulty, hardRef.difficulty);
      assertEqual("latencyGrade.demoted.interval", demoted.interval, hardRef.interval);
      // The demotion is scheduling-only: latency is still recorded, msCount
      // grows, and lastGrade keeps the learner's honest button press (Good).
      assertEqual("latencyGrade.demoted.msCount", demoted.msCount, 4);
      assertEqual("latencyGrade.demoted.lastGrade", demoted.lastGrade, 4);

      // Fast (within EMA) -> stays Good.
      const plainGood = review({ ...base }, 4, on);
      const fast = review({ ...base }, 4, on, 1000, { latencyGrading: true });
      assertClose("latencyGrade.fastStaysGood", fast.stability, plainGood.stability);

      // Slow but flag off -> not demoted.
      const slowNoFlag = review({ ...base }, 4, on, 5000);
      assertClose("latencyGrade.offNotDemoted", slowNoFlag.stability, plainGood.stability);

      // A latency-less review carries the sample count forward unchanged.
      const carried = review({ ...base }, 4, on);
      assertEqual("latencyGrade.msCountCarries", carried.msCount, 3);

      // Fewer than 3 prior samples -> EMA not yet trusted, no demotion.
      let base2 = review(freshCard(dateKey(T0)), 4, onDay(0), 1000);
      base2 = review(base2, 4, onDay(2), 1000);
      assertEqual("latencyGrade.twoSamples", base2.msCount, 2);
      const slowFew = review({ ...base2 }, 4, on, 5000, { latencyGrading: true });
      const goodFew = review({ ...base2 }, 4, on);
      assertClose("latencyGrade.needs3Samples", slowFew.stability, goodFew.stability);

      // Floor guard: ratio-slow but sub-2s in absolute terms -> not demoted.
      let base3 = review(freshCard(dateKey(T0)), 4, onDay(0), 800);
      base3 = review(base3, 4, onDay(2), 800);
      base3 = review(base3, 4, onDay(20), 800);
      const nearFast = review({ ...base3 }, 4, on, 1300, { latencyGrading: true }); // 1300 > 800*1.5 but < 2000
      const goodFloor = review({ ...base3 }, 4, on);
      assertClose("latencyGrade.floorBlocks", nearFast.stability, goodFloor.stability);
    }

    /* ---- contracts: reps monotonicity, warm ease, due, mastery ---- */
    {
      let c = review(freshCard(dateKey(T0)), 4, T0);
      c = review(c, 0, onDay(2));
      assertEqual("reps.noResetOnLapse", c.reps, 2);
      assertTrue("ease.dropsOnLapse", c.ease < 2.5, `ease ${c.ease}`);
      // Good (grade 4) leaves ease unchanged (0.1 - 1*(0.08+0.02) = 0); the
      // lapse (grade 0) then subtracts 0.8: 2.5 -> 1.7.
      assertClose("ease.sm2Rule", c.ease, 1.7, 1e-9);
      assertTrue("ease.floor", review({ ...c, ease: 1.3 }, 0, onDay(3)).ease >= 1.3);
    }
    {
      const c = review(freshCard(dateKey(T0)), 4, T0);
      assertEqual("isDue.notDueBeforeInterval", isDue(c, dateKey(onDay(1))), false);
      assertEqual("isDue.dueAtInterval", isDue(c, dateKey(onDay(2))), true);
      assertEqual("isDue.undefinedIsDue", isDue(undefined), true);
    }
    {
      // mastery() continuity: an untouched legacy card must score exactly as
      // it did under SM-2 (reps/5 + interval/30 blend).
      const legacyCard = { ease: 2.3, interval: 12, reps: 4, due: "2026-01-01" };
      const expected = Math.round(((4 / 5) * 0.5 + (12 / 30) * 0.5) * 100) / 100;
      assertEqual("mastery.legacyContinuity", mastery(legacyCard), expected);
      assertEqual("mastery.empty", mastery(undefined), 0);
      assertEqual("mastery.zeroReps", mastery(freshCard()), 0);
      const strong = { ease: 2.5, interval: 60, reps: 10, due: "2026-01-01", stability: 60, difficulty: 3 };
      assertEqual("mastery.saturates", mastery(strong), 1);
      assertTrue("mastery.inRange", mastery(review(freshCard(dateKey(T0)), 5, T0)) <= 1);
      assertEqual("masteryLabel.new", masteryLabel(0), "new");
      assertEqual("masteryLabel.mastered", masteryLabel(0.8), "mastered");
    }
    {
      const srs = {
        a: review(freshCard(dateKey(T0)), 4, T0), // due day 2
        b: review(freshCard(dateKey(T0)), 5, T0), // due day 8
      };
      assertEqual("dueCount.day2", dueCount(srs, dateKey(onDay(2))), 1);
      assertEqual("dueCount.day8", dueCount(srs, dateKey(onDay(8))), 2);
      assertTrue("reviewWeight.freshTops", reviewWeight(undefined) === 1);
      assertTrue(
        "reviewWeight.savedBoost",
        reviewWeight(srs.a, { saved: true }) > reviewWeight(srs.a),
      );
    }

    /* ---- FSRS invariants on random-ish walks ---- */
    {
      const grades = [4, 0, 3, 5, 4, 4, 0, 5, 3, 4, 0, 0, 4, 5];
      let card = freshCard(dateKey(T0));
      let day = 0;
      grades.forEach((g, i) => {
        card = review(card, g, onDay(day));
        assertTrue(`invariant.D[${i}]`, card.difficulty >= 1 && card.difficulty <= 10, `D ${card.difficulty}`);
        assertTrue(`invariant.S[${i}]`, card.stability > 0, `S ${card.stability}`);
        assertTrue(`invariant.ivl[${i}]`, card.interval >= 1, `ivl ${card.interval}`);
        assertEqual(`invariant.due[${i}]`, card.due, dateKey(onDay(day + card.interval)));
        day += card.interval;
      });
    }
  } finally {
    await server.close();
  }

  if (failures > 0) {
    console.error(`\ntest-srs: ${failures} failed, ${checks} passed`);
    process.exitCode = 1;
  } else {
    console.log(`test-srs: all ${checks} checks passed`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
