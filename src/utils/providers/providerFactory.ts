import { AIProvider, ProviderType } from '../types';
import { OpenAIProvider } from './openAIProvider';
import { AnthropicProvider } from './anthropicProvider';
import { GeminiProvider } from './geminiProvider';

export class ProviderFactory {
  private static providers: Map<ProviderType, AIProvider> = new Map();

  static getProvider(type: ProviderType): AIProvider {
    if (!this.providers.has(type)) {
      switch (type) {
        case 'openai':
          this.providers.set(type, new OpenAIProvider());
          break;
        case 'anthropic':
          this.providers.set(type, new AnthropicProvider());
          break;
        case 'gemini':
          this.providers.set(type, new GeminiProvider());
          break;
      }
    }
    return this.providers.get(type)!;
  }

  static getAvailableProviders(): ProviderType[] {
    const providers: ProviderType[] = ['openai', 'anthropic', 'gemini'];
    return providers.filter(type => {
      const provider = this.getProvider(type);
      return provider.isConfigured();
    });
  }
} 