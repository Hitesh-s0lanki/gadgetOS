import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Step {
  command: string;
  description: string;
}

interface InstallResponse { steps: Step[] }
interface GeneralResponse { answer: string }
export type TerminalResponse = InstallResponse | GeneralResponse;

export async function openaiTerminal(userRequest: string): Promise<TerminalResponse> {
  const response = await openai.chat.completions.create({
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
  });

  const text = response.choices[0].message.content?.trim() ?? "";
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.steps)) return parsed as InstallResponse;
  } catch {
    // not JSON
  }
  return { answer: text };
}
