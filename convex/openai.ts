import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getEmbeddingsWithAI(searchText: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: searchText,
  });
  return response.data[0].embedding;
}
