import type { AIMessage } from "./types";
import { OllamaProvider } from "./ollama-provider";
import { CloudProvider } from "./cloud-provider";

export type AIProviderName = "ollama" | "cloud";

export type GenerateInput = {
  history: AIMessage[];
  message: string;
  retrievedContext: string;
  fallbackMessage: string;
  locale: "en" | "ar";
};

/**
 * Only response *generation* (rephrasing already-retrieved, trusted data into natural
 * language) is provider-swappable. Intent classification, preference extraction, and
 * retrieval are all deterministic (src/lib/chatbot/*) so the pipeline never depends on
 * an LLM call to function — matching the retrieval-first architecture.
 */
export interface AIProvider {
  name: AIProviderName;
  generateResponse(input: GenerateInput): Promise<string>;
}

/**
 * Returns the configured provider only if it's actually usable (cloud requires
 * AI_API_KEY). Never throws — an unset/misconfigured AI_PROVIDER simply means "use the
 * deterministic fallback," not an error.
 */
export function getConfiguredProvider(): AIProvider | null {
  const name = process.env.AI_PROVIDER;
  if (name === "ollama") return new OllamaProvider();
  if (name === "cloud" && process.env.AI_API_KEY) return new CloudProvider();
  return null;
}

/**
 * Tries the configured provider to produce an LLM-phrased message from the retrieved
 * context. Falls back to the caller-supplied deterministic `fallbackMessage` (built
 * from the same retrieved data by src/lib/chatbot/responses.ts) when no provider is
 * configured, or the call fails for any reason — network error, timeout, bad response.
 * The chatbot must never hard-fail because an AI provider is unavailable.
 */
export async function generateMessage(input: GenerateInput): Promise<{ text: string; usedProvider: AIProviderName | "fallback" }> {
  const configured = getConfiguredProvider();
  if (configured) {
    try {
      const text = await configured.generateResponse(input);
      if (text && text.trim().length > 0) return { text, usedProvider: configured.name };
    } catch {
      // fall through to the deterministic message
    }
  }
  return { text: input.fallbackMessage, usedProvider: "fallback" };
}
