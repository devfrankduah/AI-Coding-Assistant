interface AIResponse {
  hints?: string[];
  explanation?: string;
  language?: string;
}

class SolutionPopup {
  private contentDiv: HTMLDivElement;

  constructor() {
    this.contentDiv = document.getElementById('content') as HTMLDivElement;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const params = new URLSearchParams(window.location.search);
      const solutionData = JSON.parse(decodeURIComponent(params.get('data') || '{}'));
      this.renderSolution(solutionData);
    } catch (error) {
      console.error('Failed to initialize solution popup:', error);
      this.showError('Failed to load solution');
    }
  }

  private renderSolution(data: AIResponse): void {
    if (!data.explanation) {
      this.showError('Invalid solution data');
      return;
    }

    let html = '';

    // Add hints if they exist
    // if (data.hints && data.hints.length > 0) {
    //   html += '<h2>Hints</h2>';
    //   html += '<div class="hints">';
    //   data.hints.forEach(hint => {
    //     html += `<div class="hint">${this.formatText(hint)}</div>`;
    //   });
    //   html += '</div>';
    // }

    // Add explanation
    html += '<h2>Solution</h2>';
    html += `<div class="explanation">${this.formatText(data.explanation, data.language)}</div>`;

    this.contentDiv.innerHTML = html;

    // Add copy buttons to code blocks
    this.addCopyButtons();
  }

  private formatText(text: string, language?: string): string {
    // Convert code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang || 'plaintext';
      return `
        <div class="code-block">
          <div class="language-label">${language}</div>
          <pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>
        </div>
      `;
    });

    // Convert inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert newlines to <br>
    text = text.replace(/\n/g, '<br>');

    return text;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private addCopyButtons(): void {
    const codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = 'Copy';
      
      button.onclick = async () => {
        const code = block.querySelector('code')?.textContent || '';
        await navigator.clipboard.writeText(code);
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 2000);
      };

      block.querySelector('.code-block')?.appendChild(button);
    });
  }

  private showError(message: string): void {
    this.contentDiv.innerHTML = `
      <div style="color: #dc3545; background-color: var(--bg-secondary); padding: 15px; border-radius: 4px; border: 1px solid #dc3545;">
        ${message}
      </div>
    `;
  }
}

// Initialize the solution popup
document.addEventListener('DOMContentLoaded', () => {
  new SolutionPopup();
}); 