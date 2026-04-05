import OpenAI from "openai";

// Lazy singleton — validated at call time, not module load, so build succeeds
// even when OPENAI_API_KEY is absent from the CI environment.
let _openai: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

interface Step {
  command: string;
  description: string;
}

interface InstallResponse { steps: Step[] }
interface GeneralResponse { answer: string }
export type TerminalResponse = InstallResponse | GeneralResponse;

export async function openaiTerminal(
  userRequest: string,
  signal?: AbortSignal
): Promise<TerminalResponse> {
  const response = await getClient().chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: [
          "You have two modes:",
          "1) If the user asks how to download or install something, output ONLY valid JSON: { \"steps\": [ { \"command\": string, \"description\": string } ] }",
          "2) Otherwise, reply in plain text, short and precise (no JSON).",
        ].join(" "),
      },
      { role: "user", content: userRequest },
    ],
  }, { signal });

  const text = response.choices[0].message.content?.trim() ?? "";
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.steps)) return parsed as InstallResponse;
  } catch {
    // not JSON
  }
  return { answer: text };
}
