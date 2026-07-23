import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Mail,
  MailCheck,
  MessageSquare,
  ExternalLink,
  User,
  Globe,
} from "lucide-react";
import {
  fetchAdminFeedback,
  updateAdminFeedback,
  type AdminFeedbackItem,
  type FeedbackStatus,
  type FeedbackPriority,
} from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { useAdminLang } from "./adminI18n";

/**
 * Feedback-Inbox (Kontrollzentrum §B). The `feedback` rows already flow in from
 * the FeedbackButton → submit-feedback Edge Function; this screen reads them via
 * the founder-gated admin_feedback_recent RPC and triages each with the four
 * fields the founder chose: status, priority, note, and a link to the fix.
 * Writes go through admin_feedback_update. Fail-soft: an unreachable RPC yields
 * an empty list and the empty state, never a crash.
 */

const STATUS_META: Record<FeedbackStatus, { de: string; en: string; cls: string }> = {
  neu: { de: "Neu", en: "New", cls: "bg-primary/15 text-primary" },
  erledigt: { de: "Erledigt", en: "Done", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  verworfen: { de: "Verworfen", en: "Dismissed", cls: "bg-muted text-muted-foreground" },
};

const PRIORITY_META: Record<FeedbackPriority, { de: string; en: string; cls: string }> = {
  hoch: { de: "Hoch", en: "High", cls: "bg-danger/15 text-danger" },
  normal: { de: "Normal", en: "Normal", cls: "bg-muted text-muted-foreground" },
  niedrig: { de: "Niedrig", en: "Low", cls: "bg-muted/60 text-muted-foreground/80" },
};

const STATUS_ORDER: FeedbackStatus[] = ["neu", "erledigt", "verworfen"];
const PRIORITY_ORDER: FeedbackPriority[] = ["hoch", "normal", "niedrig"];

export function AdminFeedback() {
  const { t, lang } = useAdminLang();
  const [items, setItems] = useState<AdminFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "alle">("alle");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    void fetchAdminFeedback(100).then((rows) => {
      setItems(rows);
      setLoaded(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const m = new Map<FeedbackStatus, number>();
    for (const it of items) m.set(it.status, (m.get(it.status) ?? 0) + 1);
    return m;
  }, [items]);

  const filtered = useMemo(
    () => (statusFilter === "alle" ? items : items.filter((it) => it.status === statusFilter)),
    [items, statusFilter],
  );

  const patch = useCallback(
    async (id: string, p: { status?: FeedbackStatus; priority?: FeedbackPriority; note?: string; link?: string }) => {
      // Optimistic: reflect immediately, roll back on a failed write.
      const before = items;
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));
      const ok = await updateAdminFeedback(id, p);
      if (!ok) setItems(before);
    },
    [items],
  );

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "de" ? "de-DE" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-display text-xl font-extrabold tracking-tight sm:text-2xl">
            {t("Feedback", "Feedback")}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t(
              `Posteingang · ${items.length} Nachrichten · ${counts.get("neu") ?? 0} neu`,
              `Inbox · ${items.length} messages · ${counts.get("neu") ?? 0} new`,
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft hover:text-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          {t("Aktualisieren", "Refresh")}
        </button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          active={statusFilter === "alle"}
          onClick={() => setStatusFilter("alle")}
          label={t("Alle", "All")}
          count={items.length}
        />
        {STATUS_ORDER.map((s) => (
          <FilterChip
            key={s}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
            label={STATUS_META[s][lang]}
            count={counts.get(s) ?? 0}
          />
        ))}
      </div>

      {/* List / states */}
      {loaded && items.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8 text-muted-foreground/50" />}
          text={t(
            "Noch keine Nachrichten, oder Supabase ist nicht erreichbar.",
            "No messages yet, or Supabase is unreachable.",
          )}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((it) => (
            <FeedbackRow
              key={it.id}
              item={it}
              open={openId === it.id}
              onToggle={() => setOpenId(openId === it.id ? null : it.id)}
              onPatch={(p) => void patch(it.id, p)}
              fmtDate={fmtDate}
              t={t}
              lang={lang}
            />
          ))}
          {filtered.length === 0 && loaded && (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
              {t("Keine Nachrichten in diesem Filter.", "No messages in this filter.")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
        active ? "border-primary bg-primary/15 text-primary" : "border-border bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span className="tabular-nums opacity-70">{count}</span>
    </button>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface/60 p-10 text-center">
      {icon}
      <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function FeedbackRow({
  item,
  open,
  onToggle,
  onPatch,
  fmtDate,
  t,
  lang,
}: {
  item: AdminFeedbackItem;
  open: boolean;
  onToggle: () => void;
  onPatch: (p: { status?: FeedbackStatus; priority?: FeedbackPriority; note?: string; link?: string }) => void;
  fmtDate: (iso: string) => string;
  t: (de: string, en: string) => string;
  lang: "de" | "en";
}) {
  const [note, setNote] = useState(item.note ?? "");
  const [link, setLink] = useState(item.link ?? "");

  // Keep local editors in sync if the row is patched elsewhere.
  useEffect(() => {
    setNote(item.note ?? "");
    setLink(item.link ?? "");
  }, [item.note, item.link]);

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-surface shadow-soft transition-colors", open ? "border-primary/40" : "border-border")}>
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 p-3.5 text-left">
        <span className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", item.status === "neu" ? "bg-primary" : "bg-transparent")} />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm", item.status === "neu" ? "font-semibold" : "font-medium text-muted-foreground")}>
            {item.message}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>{fmtDate(item.createdAt)}</span>
            {item.page && (
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <code className="font-mono">{item.page}</code>
              </span>
            )}
            {item.email && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {item.email}
              </span>
            )}
            <span className="inline-flex items-center gap-1" title={item.emailed ? t("per E-Mail zugestellt", "delivered by email") : t("nicht per E-Mail zugestellt", "not emailed")}>
              {item.emailed ? <MailCheck className="h-3 w-3 text-success" /> : <Mail className="h-3 w-3 opacity-50" />}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", STATUS_META[item.status].cls)}>
            {STATUS_META[item.status][lang]}
          </span>
          {item.priority !== "normal" && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", PRIORITY_META[item.priority].cls)}>
              {PRIORITY_META[item.priority][lang]}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border bg-muted/20 p-3.5">
          <p className="whitespace-pre-line text-sm text-foreground">{item.message}</p>
          {item.userAgent && (
            <p className="text-[10px] text-muted-foreground/70">{item.userAgent}</p>
          )}

          {/* Status */}
          <Segment
            label={t("Status", "Status")}
            options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s][lang], cls: STATUS_META[s].cls }))}
            value={item.status}
            onChange={(v) => onPatch({ status: v as FeedbackStatus })}
          />
          {/* Priority */}
          <Segment
            label={t("Priorität", "Priority")}
            options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_META[p][lang], cls: PRIORITY_META[p].cls }))}
            value={item.priority}
            onChange={(v) => onPatch({ priority: v as FeedbackPriority })}
          />

          {/* Note */}
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("Notiz", "Note")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => note !== (item.note ?? "") && onPatch({ note })}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Link */}
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("Link zur Änderung (PR / URL)", "Link to the change (PR / URL)")}
            </label>
            <div className="flex items-center gap-2">
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onBlur={() => link !== (item.link ?? "") && onPatch({ link })}
                placeholder="https://github.com/…/pull/123"
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface text-primary hover:bg-primary/10"
                  aria-label={t("Link öffnen", "Open link")}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Segment({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; cls: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              value === o.value ? o.cls : "bg-muted text-muted-foreground hover:text-foreground",
              value === o.value && "ring-1 ring-inset ring-current",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
