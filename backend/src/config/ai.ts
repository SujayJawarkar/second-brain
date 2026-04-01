import { env } from "./env";

export const aiConfig = {
  mode: env.aiMode,
  embedModel: env.aiMode === "pro" ? "openai" : "huggingface",
  tagModel: env.aiMode === "pro" ? "gpt-4o-mini" : "llama-3.1-8b-instant",
  vectorDims: env.aiMode === "pro" ? 1536 : 384,
};
