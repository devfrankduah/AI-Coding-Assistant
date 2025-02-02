export interface AIProvider {
  getAssistance(prompt: string): Promise<string>;
  isConfigured(): boolean;
}

export interface AIResponse {
  hints: string[];
  solution?: string;
  explanation?: string;
}

export type ProviderType = 'openai' | 'anthropic' | 'gemini'; 