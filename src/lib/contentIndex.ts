import { vocabulary } from "@/data/vocabulary";
import { collocations } from "@/data/collocations";
import { grammar } from "@/data/grammar";
import { scenarios } from "@/data/dialogues";
import { examSets } from "@/data/examSets";
import { redemittel } from "@/data/redemittel";
import { canDoStatements } from "@/data/canDo";
import { texts } from "@/data/texts";
import { missions } from "@/data/missions";
import { writingPrompts } from "@/data/writingPrompts";
import { buildContentIndex } from "@/lib/contentHash";

/**
 * The live content_id -> item map for decision-time fingerprinting (admin
 * center chunk 2). Feeds every bank into the shared `buildContentIndex`, the
 * same universe `pnpm stamp:verified` / `pnpm apply:reviews` hash against.
 *
 * HEAVY: statically imports EVERY content bank. Only ever load this module
 * with a dynamic `import()` (it backs the founder's review clicks on
 * /sources), so it rides its own lazy chunk and never touches eager code.
 */
const index = buildContentIndex({
  vocabulary,
  collocations,
  grammar,
  scenarios,
  examSets,
  redemittel,
  canDoStatements,
  texts,
  missions,
  writingPrompts,
});

/** The live content item for a provenance content_id, if it exists. */
export function contentItemById(contentId: string): unknown | undefined {
  return index.get(contentId);
}
