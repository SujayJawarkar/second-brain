import { db } from "../db";
import { items, resurfaceScores, itemTags } from "../db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

const DECAY_HALF_LIFE_DAYS = 7; // score halves every 7 days without review
const TOP_N = 5;

export class ResurfaceService {
  /**
   * Compute or update decay scores for all ready items of a user,
   * then return the top N items due for resurfacing today.
   */
  async getTodaysPicks(
    userId: string,
  ): Promise<Array<{ id: string; title: string; summary: string | null; sourceType: string; tags: string[]; decayScore: number }>> {
    const now = new Date();

    // 1. Get all ready items for this user
    const readyItems = await db
      .select({
        id: items.id,
        title: items.title,
        summary: items.summary,
        sourceType: items.sourceType,
        createdAt: items.createdAt,
        viewCount: items.viewCount,
        lastViewed: items.lastViewed,
      })
      .from(items)
      .where(and(eq(items.userId, userId), eq(items.status, "ready")));

    if (readyItems.length === 0) return [];

    const itemIds = readyItems.map((i) => i.id);

    // 2. Load existing resurface score rows
    const existing = await db
      .select()
      .from(resurfaceScores)
      .where(eq(resurfaceScores.userId, userId));

    const scoreMap = new Map(existing.map((r) => [r.itemId, r]));

    // 3. Upsert decay scores for each item
    const toUpsert: Array<{
      itemId: string;
      userId: string;
      decayScore: number;
      relevance: number;
      lastSurfaced: Date | null;
      nextSurface: Date;
    }> = [];

    for (const item of readyItems) {
      const row = scoreMap.get(item.id);
      const daysSinceCreated =
        (now.getTime() - new Date(item.createdAt).getTime()) / 86_400_000;
      const daysSinceViewed = item.lastViewed
        ? (now.getTime() - new Date(item.lastViewed).getTime()) / 86_400_000
        : daysSinceCreated;

      // Forgetting curve: score = e^(-decay * daysSinceViewed)
      const decayRate = Math.LN2 / DECAY_HALF_LIFE_DAYS;
      const decayScore = Math.exp(-decayRate * Math.max(0, daysSinceViewed));

      // Urgency: items not viewed for longer get higher relevance
      const relevance = 1 - decayScore;

      // Next surface = tomorrow if score < 0.6, else 3 days, else 7 days
      const daysUntilNext = decayScore < 0.4 ? 1 : decayScore < 0.7 ? 3 : 7;
      const nextSurface = new Date(now.getTime() + daysUntilNext * 86_400_000);

      toUpsert.push({
        itemId: item.id,
        userId,
        decayScore,
        relevance,
        lastSurfaced: row?.lastSurfaced ?? null,
        nextSurface,
      });
    }

    // Bulk upsert
    if (toUpsert.length > 0) {
      await db
        .insert(resurfaceScores)
        .values(toUpsert)
        .onConflictDoUpdate({
          target: resurfaceScores.itemId,
          set: {
            decayScore: sql`excluded.decay_score`,
            relevance: sql`excluded.relevance`,
            nextSurface: sql`excluded.next_surface`,
          },
        });
    }

    // 4. Pick top N by highest relevance (lowest decayScore = most forgotten)
    const sorted = toUpsert
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, TOP_N);

    const topIds = sorted.map((s) => s.itemId);
    if (topIds.length === 0) return [];

    // 5. Fetch tags for top items
    const tagRows = await db
      .select({ itemId: itemTags.itemId, tag: itemTags.tag })
      .from(itemTags)
      .where(inArray(itemTags.itemId, topIds));

    const tagMap = new Map<string, string[]>();
    for (const row of tagRows) {
      if (!tagMap.has(row.itemId)) tagMap.set(row.itemId, []);
      tagMap.get(row.itemId)!.push(row.tag);
    }

    // 6. Build response in relevance order
    const itemDataMap = new Map(readyItems.map((i) => [i.id, i]));

    return sorted.map((s) => {
      const item = itemDataMap.get(s.itemId)!;
      return {
        id: item.id,
        title: item.title,
        summary: item.summary,
        sourceType: item.sourceType,
        tags: tagMap.get(item.id) ?? [],
        decayScore: Math.round(s.decayScore * 100) / 100,
      };
    });
  }

  /** Mark an item as surfaced today (resets its decay clock) */
  async markSurfaced(itemId: string, userId: string) {
    const now = new Date();
    const nextSurface = new Date(now.getTime() + 7 * 86_400_000);

    await db
      .insert(resurfaceScores)
      .values({
        itemId,
        userId,
        decayScore: 1.0,
        relevance: 0,
        lastSurfaced: now,
        nextSurface,
      })
      .onConflictDoUpdate({
        target: resurfaceScores.itemId,
        set: {
          decayScore: 1.0,
          relevance: 0,
          lastSurfaced: now,
          nextSurface,
        },
      });
  }
}

export const resurfaceService = new ResurfaceService();
