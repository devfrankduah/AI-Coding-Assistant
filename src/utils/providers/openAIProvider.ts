import OpenAI from 'openai';
import { AIProvider } from '../types';
import { config } from '../../config/env';

export class OpenAIProvider implements AIProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  async getAssistance(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful coding tutor. Provide clear, educational responses with examples.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new Error('Failed to get assistance from OpenAI');
    }
  }

  isConfigured(): boolean {
    return Boolean(config.openai.apiKey);
  }
} 