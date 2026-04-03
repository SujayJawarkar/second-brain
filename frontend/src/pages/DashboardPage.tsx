import { useState } from "react";
import { Brain, Inbox } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import AppLayout from "../components/layout/AppLayout";
import SaveBar from "../components/items/SaveBar";
import ItemCard from "../components/items/ItemCard";
import { useItems } from "../hooks/useItems";
import { useSSE } from "../hooks/useSSE";
import type { Item } from "../types";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
        <Brain className="w-8 h-8 text-brand-500" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">
          Your Second Brain is empty
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Paste any URL above to start building your knowledge base. Articles,
          blogs, research — save anything.
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex justify-between pt-2 border-t border-border">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: items, isLoading } = useItems();
  const [_selected, setSelected] = useState<Item | null>(null);
  useSSE();

  const readyItems = items?.filter((i) => i.status === "ready") || [];
  const processingItems = items?.filter((i) => i.status !== "ready") || [];

  return (
    <AppLayout>
      {/* Save bar */}
      <SaveBar />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Your Knowledge Base
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {items?.length
                  ? `${items.length} item${items.length !== 1 ? "s" : ""} saved`
                  : "Nothing saved yet"}
              </p>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!items || items.length === 0) && <EmptyState />}

          {/* Processing items */}
          {processingItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Inbox className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Processing ({processingItems.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {processingItems.map((item) => (
                  <ItemCard key={item.id} item={item} onSelect={setSelected} />
                ))}
              </div>
            </div>
          )}

          {/* Ready items */}
          {readyItems.length > 0 && (
            <div>
              {processingItems.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Ready ({readyItems.length})
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyItems.map((item) => (
                  <ItemCard key={item.id} item={item} onSelect={setSelected} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
