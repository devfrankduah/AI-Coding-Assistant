import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from '../types';
import { config } from '../../config/env';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }

  async getAssistance(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: config.gemini.model });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini Error:', error);
      throw new Error('Failed to get assistance from Gemini');
    }
  }

  isConfigured(): boolean {
    return Boolean(config.gemini.apiKey);
  }
} 