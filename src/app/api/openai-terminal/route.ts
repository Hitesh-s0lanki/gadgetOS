import { NextResponse } from "next/server";
import { openaiTerminal } from "@/lib/openai-terminal";

export async function POST(request: Request) {
  try {
    const { command } = await request.json();
    if (!command || typeof command !== "string") {
      return NextResponse.json({ error: "Missing command" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const result = await openaiTerminal(command, controller.signal);
      clearTimeout(timeout);
      return NextResponse.json(result);
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json({ error: "Request timed out, try again" }, { status: 504 });
      }
      const apiErr = err as { status?: number };
      if (apiErr?.status === 429) {
        return NextResponse.json({ error: "Rate limit exceeded, try again later" }, { status: 429 });
      }
      throw err;
    }
  } catch (err) {
    console.error("Terminal API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
