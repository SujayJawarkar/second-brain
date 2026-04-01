import { db } from "../db";
import { chunks } from "../db/schema";
import { eq } from "drizzle-orm";

export class ChunkService {
  async saveChunks(itemId: string, chunkTexts: string[]) {
    if (chunkTexts.length === 0) return;

    await db.insert(chunks).values(
      chunkTexts.map((text, idx) => ({
        itemId,
        text,
        chunkIdx: idx,
      })),
    );
  }

  async getChunks(itemId: string) {
    return db
      .select()
      .from(chunks)
      .where(eq(chunks.itemId, itemId))
      .orderBy(chunks.chunkIdx);
  }

  async deleteChunks(itemId: string) {
    await db.delete(chunks).where(eq(chunks.itemId, itemId));
  }
}

export const chunkService = new ChunkService();
