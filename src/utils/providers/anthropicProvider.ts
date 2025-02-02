import Anthropic from '@anthropic-ai/sdk';
import { AIProvider } from '../types';
import { config } from '../../config/env';

export class AnthropicProvider implements AIProvider {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.anthropic.apiKey
    });
  }

  async getAssistance(prompt: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: config.anthropic.model,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Anthropic Error:', error);
      throw new Error('Failed to get assistance from Anthropic');
    }
  }

  isConfigured(): boolean {
    return Boolean(config.anthropic.apiKey);
  }
} 