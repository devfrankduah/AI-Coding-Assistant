import { debugServiceWorker } from '../debug/debugHelper';

interface ProviderInfo {
  name: string;
  description: string;
}

class Popup {
  private providerSelect: HTMLSelectElement;
  private statusDiv: HTMLDivElement;
  private descriptionDiv: HTMLDivElement;

  private providerInfo: Record<string, ProviderInfo> = {
    openai: {
      name: 'OpenAI (GPT-4)',
      description: 'Powerful language model with strong coding capabilities.'
    },
    anthropic: {
      name: 'Anthropic (Claude)',
      description: 'Advanced AI with excellent code understanding and explanation.'
    },
    gemini: {
      name: 'Google (Gemini)',
      description: 'Google\'s latest AI model optimized for coding tasks.'
    }
  };

  constructor() {
    this.providerSelect = document.getElementById('provider') as HTMLSelectElement;
    this.statusDiv = document.getElementById('status') as HTMLDivElement;
    this.descriptionDiv = document.getElementById('providerDescription') as HTMLDivElement;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('[Popup] Initializing');
      
      // Add debug info
      console.log('[Popup] Extension ID:', chrome.runtime.id);
      debugServiceWorker();
      
      // Check if background script is responding
      const isBackgroundReady = await this.checkBackgroundScript();
      if (!isBackgroundReady) {
        throw new Error('Background script not ready after multiple attempts');
      }

      await this.loadSavedProvider();
      this.setupEventListeners();
      this.updateProviderDescription();
      console.log('[Popup] Initialization complete');
    } catch (error) {
      console.error('[Popup] Initialization error:', error);
      this.showStatus('Failed to initialize extension. Please try reloading.', 'error');
    }
  }

  private async checkBackgroundScript(): Promise<boolean> {
    const maxRetries = 3;
    const retryDelay = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`[Popup] Checking background script (attempt ${i + 1}/${maxRetries})`);
        console.log('[Popup] Runtime ID:', chrome.runtime.id);
        
        const result = await new Promise<boolean>((resolve) => {
          const timeoutId = setTimeout(() => {
            console.warn('[Popup] Background script check timed out');
            resolve(false);
          }, 2000);

          chrome.runtime.sendMessage({ type: 'PING' }, response => {
            clearTimeout(timeoutId);
            
            if (chrome.runtime.lastError) {
              console.warn('[Popup] Background script not ready:', chrome.runtime.lastError);
              resolve(false);
            } else {
              console.log('[Popup] Background script response:', response);
              resolve(response?.success === true && response?.initialized === true);
            }
          });
        });

        if (result) {
          console.log('[Popup] Background script is ready');
          return true;
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } catch (error) {
        console.error('[Popup] Error checking background script:', error);
      }
    }

    console.error('[Popup] Background script check failed after', maxRetries, 'attempts');
    return false;
  }

  private async loadSavedProvider(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(['selectedProvider']);
      console.log('[Popup] Loaded provider:', result);
      if (result.selectedProvider) {
        this.providerSelect.value = result.selectedProvider;
        this.updateProviderDescription();
      }
    } catch (error) {
      console.error('[Popup] Error loading saved provider:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    this.providerSelect.addEventListener('change', () => {
      const selectedProvider = this.providerSelect.value;
      console.log('[Popup] Provider selected:', selectedProvider);
      this.saveProvider(selectedProvider).catch(error => {
        console.error('[Popup] Save error:', error);
        this.showStatus('Failed to save provider', 'error');
      });
    });
  }

  private async saveProvider(provider: string): Promise<void> {
    console.log('[Popup] Saving provider:', provider);
    
    try {
      // First save to storage
      await chrome.storage.sync.set({ selectedProvider: provider });
      console.log('[Popup] Saved to storage');

      // Then notify background script
      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'PROVIDER_CHANGED', provider },
          response => {
            if (chrome.runtime.lastError) {
              console.warn('[Popup] Runtime error:', chrome.runtime.lastError);
              // Don't reject here, just log the warning
              resolve(null);
            } else {
              resolve(response);
            }
          }
        );
      });

      this.updateProviderDescription();
      this.showStatus('AI provider updated successfully!', 'success');
    } catch (error) {
      console.error('[Popup] Error saving provider:', error);
      this.showStatus('Error saving provider settings', 'error');
      throw error;
    }
  }

  private updateProviderDescription(): void {
    const selectedProvider = this.providerSelect.value;
    const info = this.providerInfo[selectedProvider];
    if (info) {
      this.descriptionDiv.textContent = info.description;
    } else {
      console.warn('No provider info found for:', selectedProvider);
      this.descriptionDiv.textContent = '';
    }
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    console.log(`[Popup] Status message (${type}):`, message);
    this.statusDiv.textContent = message;
    this.statusDiv.className = `status ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        this.statusDiv.className = 'status';
      }, 3000);
    }
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Popup] DOM loaded');
  new Popup();
}); 