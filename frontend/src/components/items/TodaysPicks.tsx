import { useState } from "react";
import {
  Flame,
  Brain,
  FileText,
  Link2,
  StickyNote,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useResurface, type ResurfaceItem } from "../../hooks/useResurface";
import { itemsApi } from "../../api/items";

const sourceIcon = {
  url: Link2,
  pdf: FileText,
  note: StickyNote,
};

// Retention urgency derived from decay score
function urgencyLabel(score: number): { label: string; color: string; bg: string } {
  if (score < 0.3) return { label: "Fading fast", color: "text-red-500", bg: "bg-red-500/10" };
  if (score < 0.6) return { label: "Review soon", color: "text-amber-500", bg: "bg-amber-500/10" };
  return { label: "Good shape", color: "text-emerald-500", bg: "bg-emerald-500/10" };
}

// Mini progress bar showing memory retention
function RetentionBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct < 30 ? "bg-red-500" : pct < 60 ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">
        {pct}%
      </span>
    </div>
  );
}

// Single pick card
function PickCard({
  item,
  onOpen,
  onDone,
  done,
}: {
  item: ResurfaceItem;
  onOpen: (item: ResurfaceItem) => void;
  onDone: (id: string) => void;
  done: boolean;
}) {
  const Icon = sourceIcon[item.sourceType as keyof typeof sourceIcon] ?? FileText;
  const urgency = urgencyLabel(item.decayScore);

  return (
    <div
      className={`group relative flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200
        ${done
          ? "opacity-50 bg-muted/20 border-border"
          : "bg-card border-border hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md cursor-pointer"
        }`}
      onClick={() => !done && onOpen(item)}
    >
      {/* Done overlay tick */}
      {done && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {item.title}
          </p>
          {item.summary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
          )}
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer: urgency + retention bar + mark done */}
      <div className="flex items-center gap-3 pt-1 border-t border-border/60">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${urgency.bg} ${urgency.color}`}>
          {urgency.label}
        </span>
        <div className="flex-1">
          <RetentionBar score={item.decayScore} />
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDone(item.id); }}
          className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border transition-colors shrink-0 flex items-center gap-1
            bg-brand-50 text-brand hover:bg-brand-100 border-brand-200
            dark:bg-brand-950/40 dark:text-brand-400 dark:hover:bg-brand-900/50 dark:border-brand-800/50"
          title="Mark as reviewed"
        >
          <Check className="w-3 h-3" /> Done
        </button>
      </div>
    </div>
  );
}

// ── Main TodaysPicks component ───────────────────────────────────────────────
interface Props {
  onOpenDrawer: (itemId: string) => void;
}

export default function TodaysPicks({ onOpenDrawer }: Props) {
  const { data: picks, isLoading, error } = useResurface();
  const queryClient = useQueryClient();
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const markDone = useMutation({
    mutationFn: (id: string) => itemsApi.markResurfaceViewed(id),
    onMutate: (id) => setDoneIds((s) => new Set(s).add(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resurface"] }),
  });

  // Don't render at all if no picks and not loading
  if (!isLoading && (!picks || picks.length === 0)) return null;
  if (error) return null; // silent fail — don't clutter dashboard

  const allDone = picks ? picks.every((p) => doneIds.has(p.id)) : false;

  return (
    <section className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgb(var(--brand)) 0%, #7c3aed 100%)" }}
          >
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-none">
              Today's Picks
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Items fading from memory — review to retain
            </p>
          </div>
        </div>

        {/* Completion indicator */}
        {picks && picks.length > 0 && (
          <div className="flex items-center gap-1.5">
            {allDone ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                <Sparkles className="w-3 h-3" />
                All caught up!
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {doneIds.size} / {picks.length} reviewed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex gap-3">
                <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-2.5 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Pick cards */}
      {picks && picks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {picks.map((item) => (
            <PickCard
              key={item.id}
              item={item}
              done={doneIds.has(item.id)}
              onOpen={(item) => onOpenDrawer(item.id)}
              onDone={(id) => markDone.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* All done celebration */}
      {allDone && picks && picks.length > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
          <Brain className="w-4 h-4 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Great work! Your memory retention is improving 🧠
          </p>
        </div>
      )}
    </section>
  );
}
