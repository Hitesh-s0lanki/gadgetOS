import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY not configured", { status: 500 });
  }
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful AI assistant built into GadgetOS. Be concise and friendly.",
    messages,
  });

  return result.toTextStreamResponse();
}
