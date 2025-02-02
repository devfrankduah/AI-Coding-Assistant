import axios from 'axios';

export interface AIResponse {
  hints: string[];
  solution?: string;
  explanation?: string;
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getAssistance(
    problem: string,
    selectedText?: string,
    type: 'hint' | 'solution' = 'hint'
  ): Promise<AIResponse> {
    const prompt = this.createPrompt(problem, selectedText, type);
    
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful coding tutor. Provide clear, educational responses with examples.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseAIResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get AI assistance');
    }
  }

  private createPrompt(problem: string, selectedText?: string, type: 'hint' | 'solution' = 'hint'): string {
    if (selectedText) {
      return `For this part of the coding problem: "${selectedText}", please provide ${type === 'hint' ? 'a helpful hint' : 'a detailed solution'}.`;
    }

    return `For this coding problem: "${problem}", please provide ${type === 'hint' ? 'step-by-step hints' : 'a complete solution with explanation'}.`;
  }

  private parseAIResponse(response: string): AIResponse {
    // Basic parsing - you might want to enhance this based on your needs
    return {
      hints: response.split('\n').filter(line => line.trim()),
      explanation: response
    };
  }
} 