import type { MockPartId } from "@/engine/exam";
import { PART_LABEL } from "@/engine/exam";
import { PART_META } from "@/features/exam/partMeta";
import { cn } from "@/lib/utils";

/**
 * The Prüfung zone's module row (founder s195: "keep the header row from option
 * A ... this header row should consistently be there for all the screens in
 * mobile view").
 *
 * It answers one question the free trainers never answered: WHICH module am I
 * in. The exam parts have said so since s186 through the `RunBar`, which is the
 * same row with a clock and a progress strip in its right half; this is the
 * quiet version for the two trainers, in the same geometry and with the same
 * module mark, so the zone reads as one place whichever screen you are on.
 *
 * Mobile only, by founder instruction. On a desktop the trainers carry their
 * own scope rail and the room the row would take is room the task wants; the
 * exam keeps its `RunBar` at both widths because a running Teil needs the clock.
 *
 * It deliberately holds NO back button: the zone's one exit is the top-right
 * corner of the app header at every width (`AppShell`'s `ZoneExit`).
 */
export function ModuleHeader({
  part,
  title,
  right,
  className,
}: {
  part: MockPartId;
  /** Overrides the module's own name (the exam parts pass their Teil label). */
  title?: string;
  /** Optional trailing slot, right-aligned. */
  right?: React.ReactNode;
  className?: string;
}) {
  const meta = PART_META[part];
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        // Deliberately the lightest row in the zone: it names the module and
        // nothing else, so it costs a phone screen ~32px rather than the ~44px
        // a control row takes. Every pixel here comes out of the writing field.
        "flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1 shadow-soft lg:hidden",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
          meta.tile,
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", meta.ink)} />
      </span>
      <p className="min-w-0 flex-1 truncate text-[13px] font-bold">{title ?? PART_LABEL[part]}</p>
      {right}
    </div>
  );
}
