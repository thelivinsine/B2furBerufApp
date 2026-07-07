/*
 * LanguageTool runner for the data-strategy Layer 3 grammar check
 * (docs/strategy/DATA_STRATEGY.md §3). Reads a batch of German sentences,
 * runs each through a single reused JLanguageTool(GermanyGerman) instance,
 * and writes one line per finding. It is a dumb pipe: all bucketing and
 * false-positive filtering lives in scripts/verify-grammar.mjs, so the rule
 * policy is versioned in JS, not baked into this jar-dependent step.
 *
 * Wire format (control chars, so it never collides with German text — no JSON
 * dependency, which the Maven-resolved LanguageTool jars do not guarantee):
 *   input  : records separated by \x1e (RS); each record is  id \x1f text
 *   output : one finding per line, fields separated by \x1f (US):
 *            id \x1f ruleId \x1f categoryId \x1f issueType \x1f fromPos \x1f message \x1f fragment \x1f replacements
 *   Fields are sanitised of \r/\n/\x1f so the row stays parseable.
 *
 * Usage:  java -cp "<lib>/*:<classesDir>" LtCheck <inputFile> <outputFile>
 */
import org.languagetool.JLanguageTool;
import org.languagetool.language.GermanyGerman;
import org.languagetool.rules.RuleMatch;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class LtCheck {
  private static final char RS = (char) 0x1e; // record separator
  private static final char US = (char) 0x1f; // field separator

  private static String clean(String s) {
    if (s == null) return "";
    return s.replace('\r', ' ').replace('\n', ' ').replace(US, ' ').replace(RS, ' ').trim();
  }

  public static void main(String[] args) throws IOException {
    if (args.length < 2) {
      System.err.println("usage: LtCheck <inputFile> <outputFile>");
      System.exit(2);
    }
    String raw = Files.readString(Path.of(args[0]), StandardCharsets.UTF_8);

    JLanguageTool lt = new JLanguageTool(new GermanyGerman());

    StringBuilder out = new StringBuilder();
    int checked = 0, findings = 0;
    for (String record : raw.split(String.valueOf(RS))) {
      if (record.isEmpty()) continue;
      int sep = record.indexOf(US);
      if (sep < 0) continue;
      String id = record.substring(0, sep);
      String text = record.substring(sep + 1);
      if (text.isBlank()) continue;
      checked++;

      List<RuleMatch> matches;
      try {
        matches = lt.check(text);
      } catch (Exception e) {
        System.err.println("check failed for " + id + ": " + e.getMessage());
        continue;
      }
      for (RuleMatch m : matches) {
        String issueType = m.getRule().getLocQualityIssueType() == null
            ? "uncategorized" : m.getRule().getLocQualityIssueType().toString();
        String catId = m.getRule().getCategory() == null
            ? "" : m.getRule().getCategory().getId().toString();
        int from = m.getFromPos(), to = m.getToPos();
        String fragment = (from >= 0 && to <= text.length() && to > from)
            ? text.substring(from, to) : "";
        List<String> reps = m.getSuggestedReplacements();
        String replacements = reps == null ? "" : String.join(" | ",
            reps.size() > 5 ? reps.subList(0, 5) : reps);

        List<String> row = new ArrayList<>();
        row.add(clean(id));
        row.add(clean(m.getRule().getId()));
        row.add(clean(catId));
        row.add(clean(issueType));
        row.add(String.valueOf(from));
        row.add(clean(m.getMessage()));
        row.add(clean(fragment));
        row.add(clean(replacements));
        out.append(String.join(String.valueOf(US), row)).append('\n');
        findings++;
      }
    }

    Files.writeString(Path.of(args[1]), out.toString(), StandardCharsets.UTF_8);
    System.err.println("LtCheck: " + checked + " sentences checked, " + findings + " raw findings.");
  }
}
