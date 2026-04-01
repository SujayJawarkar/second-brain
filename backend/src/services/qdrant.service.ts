import { qdrant } from "../config/qdrant";
import { aiConfig } from "../config/ai";

export class QdrantService {
  collectionName(userId: string): string {
    const suffix = aiConfig.mode === "pro" ? "_pro" : "_free";
    return `chunks_${userId}${suffix}`;
  }

  async ensureCollection(userId: string) {
    const name = this.collectionName(userId);

    try {
      await qdrant.getCollection(name);
    } catch {
      // Collection doesn't exist — create it
      await qdrant.createCollection(name, {
        vectors: {
          size: aiConfig.vectorDims,
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        quantization_config: {
          scalar: {
            type: "int8",
            quantile: 0.99,
            always_ram: true,
          },
        },
      });
      console.log(`✅ Created Qdrant collection: ${name}`);
    }
  }

  async upsertChunks(
    userId: string,
    chunks: { id: string; text: string; chunkIdx: number }[],
    vectors: number[][],
    itemMeta: {
      itemId: string;
      title: string;
      sourceType: string;
      tags: string[];
      createdAt: string;
    },
  ) {
    const name = this.collectionName(userId);
    const points = chunks.map((chunk, i) => ({
      id: chunk.id,
      vector: vectors[i],
      payload: {
        item_id: itemMeta.itemId,
        chunk_idx: chunk.chunkIdx,
        title: itemMeta.title,
        source_type: itemMeta.sourceType,
        tags: itemMeta.tags,
        created_at: itemMeta.createdAt,
      },
    }));

    await qdrant.upsert(name, { wait: true, points });
  }

  async deleteItem(userId: string, itemId: string) {
    const name = this.collectionName(userId);
    await qdrant.delete(name, {
      filter: {
        must: [{ key: "item_id", match: { value: itemId } }],
      },
    });
  }

  async search(userId: string, queryVector: number[], limit: number = 50) {
    const name = this.collectionName(userId);

    const results = await qdrant.search(name, {
      vector: queryVector,
      limit,
      with_payload: true,
    });

    return results;
  }
}

export const qdrantService = new QdrantService();
