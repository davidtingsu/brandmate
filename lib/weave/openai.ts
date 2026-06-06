import OpenAI from "openai";
import { wrapOpenAI } from "weave";
import { MODEL, EMBEDDING_MODEL } from "@/lib/config";

function createClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return wrapOpenAI(new OpenAI({ apiKey }));
}

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) {
    client = createClient();
  }
  return client;
}

export { MODEL, EMBEDDING_MODEL };
