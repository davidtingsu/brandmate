import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/config";
import { getOpenAI } from "@/lib/weave/openai";

export async function embedText(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return response.data[0]?.embedding ?? [];
}

export function embeddingToBuffer(embedding: number[]): Buffer {
  const float32 = new Float32Array(embedding);
  return Buffer.from(float32.buffer);
}
