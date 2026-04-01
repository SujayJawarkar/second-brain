import { db } from "../db";
import { items, itemTags } from "../db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { embeddingService } from "./embedding.service";
import { qdrantService } from "./qdrant.service";

export class SearchService {
  async search(
    userId: string,
    query: string,
    plan: "free" | "pro",
    limit: number = 20,
    sourceType?: "url" | "pdf" | "note",
  ) {
    if (plan === "pro") {
      return this.hybridSearch(userId, query, limit, sourceType);
    }
    return this.keywordSearch(userId, query, limit, sourceType);
  }

  // Free tier — PostgreSQL full text search
  private async keywordSearch(
    userId: string,
    query: string,
    limit: number,
    sourceType?: string,
  ) {
    const conditions = [
      eq(items.userId, userId),
      eq(items.status, "ready"),
      sql`(
  to_tsvector('english', ${items.title} || ' ' || ${items.contentMd})
  @@ plainto_tsquery('english', ${query})
  OR EXISTS (
    SELECT 1 FROM item_tags
    WHERE item_tags.item_id = ${items.id}
    AND item_tags.tag ILIKE ${"%" + query + "%"}
  )
)`,
    ];

    if (sourceType) {
      conditions.push(eq(items.sourceType, sourceType as any));
    }

    const results = await db
      .select({
        id: items.id,
        title: items.title,
        url: items.url,
        summary: items.summary,
        sourceType: items.sourceType,
        createdAt: items.createdAt,
      })
      .from(items)
      .where(and(...conditions))
      .limit(limit);

    return results.map((r) => ({ ...r, score: 1.0, matchedChunk: null }));
  }

  // Pro tier — vector search + keyword search merged with RRF
  private async hybridSearch(
    userId: string,
    query: string,
    limit: number,
    sourceType?: string,
  ) {
    // Step 1: embed the query
    const [queryVector] = await embeddingService.embed([query]);

    // Step 2: vector search via Qdrant
    const vectorHits = await qdrantService.search(userId, queryVector, 50);

    // Step 3: keyword search
    const keywordResults = await this.keywordSearch(
      userId,
      query,
      50,
      sourceType,
    );

    // Step 4: RRF merge
    const k = 60;
    const scores: Record<string, number> = {};
    const itemChunkMap: Record<string, string> = {};

    vectorHits.forEach((hit, rank) => {
      const itemId = hit.payload?.item_id as string;
      if (!itemId) return;
      scores[itemId] = (scores[itemId] || 0) + (1 / (k + rank)) * 0.7;
      itemChunkMap[itemId] = (hit.payload?.title as string) || "";
    });

    keywordResults.forEach((hit, rank) => {
      scores[hit.id] = (scores[hit.id] || 0) + (1 / (k + rank)) * 0.3;
    });

    // Step 5: sort by RRF score
    const sortedIds = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    if (sortedIds.length === 0) return [];

    // Step 6: fetch full item details
    const resultItems = await db
      .select({
        id: items.id,
        title: items.title,
        url: items.url,
        summary: items.summary,
        sourceType: items.sourceType,
        createdAt: items.createdAt,
      })
      .from(items)
      .where(and(eq(items.userId, userId), inArray(items.id, sortedIds)));

    // Step 7: attach scores and sort
    return resultItems
      .map((item) => ({
        ...item,
        score: scores[item.id] || 0,
        matchedChunk: itemChunkMap[item.id] || null,
      }))
      .sort((a, b) => b.score - a.score);
  }
}

export const searchService = new SearchService();
