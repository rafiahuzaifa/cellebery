import type { AIProvider, AIProviderName, GenerateInput } from "./provider";
import { SYSTEM_PROMPT, buildUserTurnPrompt } from "./prompts";

/**
 * Generic OpenAI chat-completions-compatible adapter — works with OpenAI directly and
 * with most compatible providers (set AI_BASE_URL to point elsewhere). Requires
 * AI_API_KEY; the resolver in provider.ts never selects this class without one.
 */
export class CloudProvider implements AIProvider {
  name: AIProviderName = "cloud";

  private baseUrl(): string {
    return process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  }

  private model(): string {
    return process.env.AI_MODEL ?? "gpt-4o-mini";
  }

  async generateResponse(input: GenerateInput): Promise<string> {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) throw new Error("AI_API_KEY is not configured");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${this.baseUrl()}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model(),
          temperature: 0.4,
          max_tokens: 400,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...input.history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: buildUserTurnPrompt(input.retrievedContext, input.message) },
          ],
        }),
      });
      if (!response.ok) throw new Error(`AI provider responded ${response.status}`);
      const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content ?? "";
    } finally {
      clearTimeout(timeout);
    }
  }
}
