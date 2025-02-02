import { AIService } from "../utils/aiService";

export class BackgroundScript {
  private aiService: AIService;
  private isInitialized: boolean = false;

  constructor() {
    console.log("[Background] Constructing BackgroundScript");
    this.aiService = new AIService();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log("[Background] Starting initialization");

      // Set up listeners first
      this.setupMessageListener();

      // Then load saved provider
      await this.loadSavedProvider();

      this.isInitialized = true;
      console.log("[Background] Initialization complete");
    } catch (error) {
      console.error("[Background] Initialization failed:", error);
      this.isInitialized = false;
    }
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("[Background] Received message:", message, "from:", sender);

      if (message.type === "PING") {
        console.log(
          "[Background] Handling PING, initialized:",
          this.isInitialized
        );
        sendResponse({ success: true, initialized: this.isInitialized });
        return true;
      }

      if (!this.isInitialized) {
        console.warn("[Background] Received message before initialization");
        sendResponse({ error: "Background script not initialized" });
        return true;
      }

      this.handleMessage(message)
        .then((response) => {
          console.log("[Background] Sending response:", response);
          sendResponse(response);
        })
        .catch((error) => {
          console.error("[Background] Error handling message:", error);
          sendResponse({ error: error.message });
        });

      return true;
    });
  }

  private async handleMessage(message: any): Promise<any> {
    switch (message.type) {
      case "PROVIDER_CHANGED":
        try {
          this.aiService.setProvider(message.provider);
          return { success: true };
        } catch (error: any) {
          throw new Error(`Failed to change provider: ${error.message}`);
        }

      case "TEXT_SELECTED":
      case "HELP_REQUESTED":
        try {
          console.log("Received request with language:", message.data.language);

          const languagePrompt = `Please provide a solution in ${message.data.language}. `;
          const fullDescription = languagePrompt + message.data.description;

          const response = await this.aiService.getAssistance(
            fullDescription,
            message.type === "TEXT_SELECTED"
              ? message.data.selectedText
              : undefined,
            message.type === "TEXT_SELECTED" ? "hint" : "solution"
          );

          // Open solution in new popup
          const queryParams = new URLSearchParams({
            data: encodeURIComponent(JSON.stringify(response)),
          }).toString();

          chrome.windows.create({
            url: chrome.runtime.getURL(`solution.html?${queryParams}`),
            type: "popup",
            width: 800,
            height: 600,
          });

          return {
            data: {
              ...response,
              language: message.data.language, // Include language in response
            },
          };
        } catch (error: any) {
          throw new Error(`Failed to get AI assistance: ${error.message}`);
        }

      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  private async loadSavedProvider(): Promise<void> {
    try {
      const { selectedProvider } = await chrome.storage.sync.get(
        "selectedProvider"
      );
      console.log("[Background] Loaded saved provider:", selectedProvider);

      if (selectedProvider) {
        this.aiService.setProvider(selectedProvider);
      }
    } catch (error) {
      console.error("[Background] Failed to load saved provider:", error);
      throw error;
    }
  }
}

// Handle installation and updates
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Background] Extension installed/updated");
});
