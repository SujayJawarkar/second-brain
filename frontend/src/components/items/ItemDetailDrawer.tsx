import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ExternalLink,
  FileText,
  Link2,
  StickyNote,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Tag,
  Sparkles,
  BookOpen,
  Network,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useItemDetail } from "../../hooks/useItemDetail";
import type { Item } from "../../types";

const sourceIcon = { url: Link2, pdf: FileText, note: StickyNote };
const statusConfig = {
  queued:     { icon: Clock,         color: "text-yellow-500 bg-yellow-500/10", label: "Queued" },
  processing: { icon: Loader2,       color: "text-blue-500 bg-blue-500/10",    label: "Processing" },
  ready:      { icon: CheckCircle2,  color: "text-emerald-500 bg-emerald-500/10", label: "Ready" },
  failed:     { icon: AlertCircle,   color: "text-red-500 bg-red-500/10",      label: "Failed" },
};

const getHostname = (url: string) => {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
};

interface Props {
  itemId: string | null;
  onClose: () => void;
}

// ── Section Heading ───────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

// ── Related Item Row ──────────────────────────────────────────────────────────
function RelatedRow({
  item,
  onClick,
}: {
  item: { id: string; title: string; url: string | null; sourceType: string; similarity: number };
  onClick: () => void;
}) {
  const Icon = sourceIcon[item.sourceType as keyof typeof sourceIcon] ?? FileText;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl
        hover:bg-muted/60 transition-colors text-left group"
    >
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {item.title}
        </p>
        {item.url && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{getHostname(item.url)}</p>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0 mt-1 tabular-nums">
        {Math.round(item.similarity * 100)}%
      </span>
    </button>
  );
}

// ── Main Drawer ───────────────────────────────────────────────────────────────
export default function ItemDetailDrawer({ itemId, onClose }: Props) {
  const { item: itemQuery, related: relatedQuery } = useItemDetail(itemId);
  const overlayRef = useRef<HTMLDivElement>(null);
  const item = itemQuery.data as (Item & { contentMd?: string }) | undefined;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (itemId) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [itemId]);

  const isOpen = !!itemId;
  const status = item ? statusConfig[item.status] : null;
  const StatusIcon = status?.icon;
  const isProcessing = item?.status === "processing" || item?.status === "queued";
  const SourceIcon = item ? sourceIcon[item.sourceType] : FileText;

  // Render into document.body so fixed positioning escapes AppLayout's overflow-hidden
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[520px]
          bg-card border-l border-border shadow-2xl
          flex flex-col overflow-hidden
          transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border shrink-0">
          {itemQuery.isLoading ? (
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ) : item ? (
            <>
              {/* Source icon */}
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <SourceIcon className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground leading-snug line-clamp-2">
                  {item.title}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Status badge */}
                  {status && StatusIcon && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                      <StatusIcon className={`w-3 h-3 ${isProcessing ? "animate-spin" : ""}`} />
                      {status.label}
                    </span>
                  )}
                  {/* Source url */}
                  {item.url && item.sourceType === "url" && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {getHostname(item.url)}
                    </span>
                  )}
                  {/* Date */}
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </>
          ) : null}

          {/* Action buttons — top right */}
          <div className="flex items-center gap-1 shrink-0">
            {item?.url && item.sourceType === "url" && (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => window.open(item.url!, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose} id="drawer-close-btn">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── Scrollable Body ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {itemQuery.isLoading ? (
            <div className="p-5 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/3 mb-3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/4 mb-3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ) : item ? (
            <div className="p-5 space-y-6">

              {/* ── AI Summary ────────────────────────────────────────────── */}
              {item.summary && item.status === "ready" && (
                <section>
                  <SectionHeading icon={Sparkles} label="AI Summary" />
                  <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/50 rounded-xl p-4">
                    <p className="text-sm text-foreground leading-relaxed">{item.summary}</p>
                  </div>
                </section>
              )}

              {/* ── Tags ──────────────────────────────────────────────────── */}
              {item.tags && item.tags.length > 0 && (
                <section>
                  <SectionHeading icon={Tag} label="Tags" />
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1 rounded-lg">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Full Content ──────────────────────────────────────────── */}
              {(item as any).contentMd && (
                <section>
                  <SectionHeading icon={BookOpen} label="Full Content" />
                  <div
                    className="text-sm text-foreground leading-relaxed
                      bg-muted/40 rounded-xl p-4 max-h-[400px] overflow-y-auto
                      border border-border whitespace-pre-wrap scroll-smooth"
                  >
                    {(item as any).contentMd}
                  </div>
                </section>
              )}

              {/* Processing / failed state */}
              {item.status !== "ready" && (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {item.status === "failed" ? "Processing failed" : "Processing content…"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.status === "failed"
                        ? "This item could not be processed. Try deleting and re-adding it."
                        : "Summary, tags and full content will appear here when ready."}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Related Items ─────────────────────────────────────────── */}
              <section>
                <SectionHeading icon={Network} label="Related Items" />
                {relatedQuery.isLoading ? (
                  <div className="space-y-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex gap-3 px-3 py-2.5">
                        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-2.5 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : relatedQuery.data && relatedQuery.data.length > 0 ? (
                  <div className="-mx-1 space-y-0.5">
                    {relatedQuery.data.map((rel) => (
                      <RelatedRow
                        key={rel.id}
                        item={rel}
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("kortex:open-item", { detail: { itemId: rel.id } })
                          );
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground px-1">
                    No related items found yet. Add more content to discover connections.
                  </p>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </>,
    document.body
  );
}
