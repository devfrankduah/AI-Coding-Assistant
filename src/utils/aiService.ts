import { AIResponse } from "./types";
import { ProviderFactory } from "./providers/providerFactory";

export class AIService {
  private currentProvider = "openai";

  async getAssistance(
    problem: string,
    selectedText?: string,
    type: "hint" | "solution" = "hint"
  ): Promise<AIResponse> {
    const prompt = this.createPrompt(problem, selectedText, type);

    try {
      const provider = ProviderFactory.getProvider(this.currentProvider as any);
      const response = await provider.getAssistance(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("Failed to get AI assistance");
    }
  }

  setProvider(providerType: string): void {
    if (ProviderFactory.getAvailableProviders().includes(providerType as any)) {
      this.currentProvider = providerType;
    } else {
      throw new Error("Provider not available");
    }
  }

  private createPrompt(
    problem: string,
    selectedText?: string,
    type: "hint" | "solution" = "hint"
  ): string {
    if (selectedText) {
      return `For this part of the coding problem: "${selectedText}", please provide ${
        type === "hint" ? "a helpful hint" : "a detailed solution"
      }.`;
    }

    return `For this coding problem: "${problem}", please provide ${
      type === "hint"
        ? "step-by-step hints"
        : "a complete solution with explanation"
    }.`;
  }

  private parseAIResponse(response: string): AIResponse {
    return {
      hints: response.split("\n").filter((line) => line.trim()),
      explanation: response,
    };
  }
}
