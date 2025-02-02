interface ProblemData {
  title: string;
  description: string;
  platform: 'leetcode' | 'exercism';
  difficulty?: string;
  selectedText?: string;
}

export class ProblemParser {
  private platform: string;

  constructor() {
    this.platform = window.location.hostname;
  }

  public getProblemData(): ProblemData {
    if (this.platform.includes('leetcode')) {
      return this.parseLeetCodeProblem();
    } else if (this.platform.includes('exercism')) {
      return this.parseExercismProblem();
    }
    throw new Error('Unsupported platform');
  }

  private parseLeetCodeProblem(): ProblemData {
    const title = document.querySelector('[data-cy="question-title"]')?.textContent || '';
    const description = document.querySelector('[data-cy="question-content"]')?.textContent || '';
    const difficulty = document.querySelector('[diff]')?.getAttribute('diff') || '';

    return {
      title,
      description,
      difficulty,
      platform: 'leetcode'
    };
  }

  private parseExercismProblem(): ProblemData {
    const title = document.querySelector('.exercise-header')?.textContent || '';
    const description = document.querySelector('.exercise-description')?.textContent || '';

    return {
      title,
      description,
      platform: 'exercism'
    };
  }
} 