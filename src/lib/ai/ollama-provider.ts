import type { AIProvider, AIProviderName, GenerateInput } from "./provider";
import { SYSTEM_PROMPT, buildUserTurnPrompt } from "./prompts";

/** Free, local-only development provider — calls a locally running Ollama instance. */
export class OllamaProvider implements AIProvider {
  name: AIProviderName = "ollama";

  private baseUrl(): string {
    return process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  }

  private model(): string {
    return process.env.AI_MODEL ?? "llama3.2";
  }

  async generateResponse(input: GenerateInput): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${this.baseUrl()}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model(),
          stream: false,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...input.history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: buildUserTurnPrompt(input.retrievedContext, input.message) },
          ],
        }),
      });
      if (!response.ok) throw new Error(`Ollama responded ${response.status}`);
      const data = (await response.json()) as { message?: { content?: string } };
      return data.message?.content ?? "";
    } finally {
      clearTimeout(timeout);
    }
  }
}
