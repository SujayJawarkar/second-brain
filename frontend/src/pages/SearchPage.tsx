import { useState, useCallback } from "react";
import {
  Search,
  Loader2,
  Link2,
  FileText,
  StickyNote,
  ExternalLink,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import AppLayout from "../components/layout/AppLayout";
import { itemsApi } from "../api/items";
import type { Item } from "../types";
import { useAuthStore } from "../store/auth.store";
import { useSSE } from "../hooks/useSSE";
import debounce from "lodash.debounce";

// install lodash.debounce
// npm install lodash.debounce @types/lodash.debounce

const sourceIcon = {
  url: Link2,
  pdf: FileText,
  note: StickyNote,
};

function SearchResult({
  item,
}: {
  item: Item & { score?: number; matchedChunk?: string };
}) {
  const SourceIcon = sourceIcon[item.sourceType];

  return (
    <div className="group bg-card border border-border rounded-2xl p-5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <SourceIcon className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium text-foreground text-sm leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {item.title}
            </h3>

            <div className="flex items-center gap-2 shrink-0">
              {item.score !== undefined && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {Math.round(item.score * 100)}% match
                </Badge>
              )}
              {item.url && (
                <button
                  onClick={() => window.open(item.url!, "_blank")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {item.url && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {new URL(item.url).hostname.replace("www.", "")}
            </p>
          )}

          {item.summary && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
              {item.summary}
            </p>
          )}

          {item.matchedChunk && (
            <div className="mt-3 px-3 py-2 bg-brand-50 dark:bg-brand-950/50 rounded-lg border-l-2 border-brand-400">
              <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed line-clamp-2">
                {item.matchedChunk}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
              {item.sourceType}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptySearch({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <Search className="w-10 h-10 text-muted-foreground/40" />
      <div>
        <p className="font-medium text-foreground text-sm">
          No results for "{query}"
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Try different keywords or save more content first
        </p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const { user } = useAuthStore();
  useSSE();

  const doSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setSearched(false);
        return;
      }

      setLoading(true);
      try {
        const res = await itemsApi.search(q);
        setResults(res.data.results);
        setLatency(res.data.latency_ms);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400),
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground">Search</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.plan === "pro"
                ? "Semantic + keyword search across your knowledge base"
                : "Keyword search — upgrade to Pro for semantic search"}
            </p>
          </div>

          {/* Search input */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={handleChange}
              placeholder="Search your knowledge base..."
              className="pl-10 h-12 text-sm bg-card rounded-xl"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {/* Results meta */}
          {searched && !loading && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""}
                {latency !== null && ` · ${latency}ms`}
              </p>
              <Badge variant="outline" className="text-[10px]">
                {user?.plan === "pro" ? "Hybrid search" : "Keyword search"}
              </Badge>
            </div>
          )}

          {/* Results */}
          {!loading && searched && results.length === 0 && (
            <EmptySearch query={query} />
          )}

          <div className="space-y-3">
            {results.map((item) => (
              <SearchResult key={item.id} item={item} />
            ))}
          </div>

          {/* Initial state */}
          {!searched && !loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  Search anything you've saved
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Articles, notes, PDFs — find connections across your entire
                  knowledge base
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
