import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/bmp", "image/svg+xml"];
const TEXT_MIME_TYPES = ["text/plain", "text/markdown"];

export async function getEmbeddingsWithAI(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return res.data[0].embedding;
}

export async function describeImage(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const b64 = Buffer.from(buffer).toString("base64");
  const imageDataUrl = `data:${file.type};base64,${b64}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Describe this image briefly." },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
  });
  return res.choices[0].message.content?.trim() ?? "";
}

export async function getFileEmbedding(file: File): Promise<number[]> {
  let description: string;
  if (IMAGE_MIME_TYPES.includes(file.type)) {
    description = await describeImage(file);
  } else if (TEXT_MIME_TYPES.includes(file.type)) {
    description = await file.text();
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  const snippet = description.length > 1000 ? description.slice(0, 1000) + "…" : description;
  return getEmbeddingsWithAI(snippet);
}
