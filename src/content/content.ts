import { ProblemParser } from "./problemParser";

class ContentScript {
  private parser: ProblemParser;
  private isWaitingForSelection: boolean = false;
  private selectionOverlay: HTMLDivElement | null = null;
  private languageSelect: HTMLSelectElement | null = null;
  private messageBox: HTMLDivElement | null = null;
  private helpButton: HTMLButtonElement | null = null;
  private isProcessing: boolean = false;

  constructor() {
    this.parser = new ProblemParser();
    this.initialize();
  }

  private initialize(): void {
    this.setupSelectionListener();
    this.injectAssistantButton();
    this.createSelectionOverlay();
    this.setupThemeObserver();
  }

  private setupThemeObserver(): void {
    // Watch for theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      this.updateTheme(e.matches);
    };
    mediaQuery.addListener(handleThemeChange);
    handleThemeChange(mediaQuery); // Initial theme
  }

  private updateTheme(isDark: boolean): void {
    if (this.messageBox) {
      this.messageBox.style.backgroundColor = isDark ? "#2d2d2d" : "white";
      this.messageBox.style.color = isDark ? "#ffffff" : "#000000";
    }
    if (this.languageSelect) {
      this.languageSelect.style.backgroundColor = isDark ? "#3d3d3d" : "white";
      this.languageSelect.style.color = isDark ? "#ffffff" : "#000000";
    }
  }

  private createSelectionOverlay(): void {
    this.selectionOverlay = document.createElement("div");
    this.selectionOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      z-index: 10000;
      display: none;
      pointer-events: none;
    `;

    // Create draggable message box
    this.messageBox = document.createElement("div");
    this.messageBox.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      font-family: Arial, sans-serif;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: move;
      user-select: none;
    `;

    // Make message box draggable
    this.makeDraggable(this.messageBox);

    const text = document.createElement("span");
    text.textContent =
      "Please highlight the code you want help with and press Enter";
    this.messageBox.appendChild(text);

    // Add language selector with prevented event bubbling
    this.languageSelect = document.createElement("select");
    this.languageSelect.style.cssText = `
      padding: 5px 10px;
      border-radius: 4px;
      border: 1px solid #ccc;
      font-family: Arial, sans-serif;
      margin-left: 10px;
      cursor: pointer;
      pointer-events: auto;
      background-color: white;
    `;

    // Prevent drag when interacting with select
    this.languageSelect.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    // Prevent drag when changing selection
    this.languageSelect.addEventListener("change", (e) => {
      e.stopPropagation();
      console.log("Language changed to:", this.languageSelect?.value);
    });

    const languages = [
      { value: "python", label: "Python" },
      { value: "javascript", label: "JavaScript" },
      { value: "typescript", label: "TypeScript" },
      { value: "java", label: "Java" },
      { value: "cpp", label: "C++" },
      { value: "csharp", label: "C#" },
      { value: "go", label: "Go" },
      { value: "ruby", label: "Ruby" },
      { value: "rust", label: "Rust" },
      { value: "swift", label: "Swift" },
    ];

    languages.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.value;
      option.textContent = lang.label;
      this.languageSelect?.appendChild(option);
    });

    if (this.messageBox && this.languageSelect) {
      this.messageBox.appendChild(this.languageSelect);
    }

    // Add cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.cssText = `
      padding: 5px 10px;
      border-radius: 4px;
      border: none;
      background: #dc3545;
      color: white;
      cursor: pointer;
      font-family: Arial, sans-serif;
      margin-left: 10px;
    `;
    cancelButton.onclick = (e) => {
      e.stopPropagation(); // Prevent drag
      this.cancelSelection();
    };
    this.messageBox.appendChild(cancelButton);

    this.selectionOverlay.appendChild(this.messageBox);
    document.body.appendChild(this.selectionOverlay);

    // Handle Enter key press
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.isWaitingForSelection) {
        const selectedText = window.getSelection()?.toString().trim();
        if (selectedText) {
          this.handleTextSelection(selectedText);
        }
      } else if (e.key === "Escape" && this.isWaitingForSelection) {
        this.cancelSelection();
      }
    });
  }

  private makeDraggable(element: HTMLElement): void {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e: MouseEvent) {
      e.preventDefault();
      // Get mouse position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e: MouseEvent) {
      e.preventDefault();
      // Calculate new position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Set element's new position
      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";
      element.style.transform = "none"; // Remove transform when dragging
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  private injectAssistantButton(): void {
    this.helpButton = document.createElement("button");
    this.helpButton.innerHTML = "Get Help";
    this.helpButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      padding: 10px 20px;
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    this.helpButton.addEventListener("mouseover", () => {
      if (!this.isProcessing) {
        this.helpButton!.style.transform = "translateY(-2px)";
        this.helpButton!.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
      }
    });

    this.helpButton.addEventListener("mouseout", () => {
      if (!this.isProcessing) {
        this.helpButton!.style.transform = "translateY(0)";
        this.helpButton!.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
      }
    });

    this.helpButton.onclick = () => {
      if (!this.isProcessing) {
        this.startSelectionMode();
      }
    };
    document.body.appendChild(this.helpButton);
  }

  private setProcessingState(isProcessing: boolean): void {
    this.isProcessing = isProcessing;
    if (this.helpButton) {
      if (isProcessing) {
        this.helpButton.innerHTML = `
          <span class="spinner" style="
            width: 16px;
            height: 16px;
            border: 2px solid #ffffff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></span>
          Processing...
        `;
        this.helpButton.style.cursor = "not-allowed";
        this.helpButton.style.opacity = "0.7";
      } else {
        this.helpButton.innerHTML = "Get Help";
        this.helpButton.style.cursor = "pointer";
        this.helpButton.style.opacity = "1";
      }
    }
  }

  private handleTextSelection(selectedText: string): void {
    if (!this.isWaitingForSelection || !selectedText) return;

    // Don't automatically send - wait for Enter key
    const messageText = this.messageBox?.querySelector("span");
    if (messageText) {
      messageText.textContent = "Press Enter to send your selection";
    }
  }

  private startSelectionMode(): void {
    this.isWaitingForSelection = true;
    if (this.selectionOverlay) {
      this.selectionOverlay.style.display = "block";
      document.body.style.cursor = "text";
    }
  }

  private cancelSelection(): void {
    this.isWaitingForSelection = false;
    if (this.selectionOverlay) {
      this.selectionOverlay.style.display = "none";
      document.body.style.cursor = "default";
    }
  }

  private setupSelectionListener(): void {
    let currentSelection: string = "";

    // Handle text selection
    document.addEventListener("mouseup", () => {
      if (!this.isWaitingForSelection) return;

      const selectedText = window.getSelection()?.toString().trim();
      if (selectedText) {
        currentSelection = selectedText;
        const messageText = this.messageBox?.querySelector("span");
        if (messageText) {
          messageText.textContent = "Press Enter to send your selection";
        }
      }
    });

    // Handle Enter key press
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.isWaitingForSelection && currentSelection) {
        this.sendToAI(currentSelection);
      } else if (e.key === "Escape" && this.isWaitingForSelection) {
        this.cancelSelection();
      }
    });
  }

  private sendToAI(selectedText: string): void {
    if (!this.languageSelect) return;

    const selectedLanguage = this.languageSelect.value;
    console.log("Sending request for language:", selectedLanguage);

    this.cancelSelection();
    this.setProcessingState(true);

    const problemData = {
      title:
        document.querySelector('[data-cy="question-title"]')?.textContent || "",
      description: selectedText,
      platform: "leetcode",
      language: selectedLanguage, // Ensure this is the selected language
    };

    chrome.runtime.sendMessage(
      {
        type: "HELP_REQUESTED",
        data: problemData,
      },
      (response) => {
        this.setProcessingState(false);
        if (response?.error) {
          console.error("Error:", response.error);
        }
      }
    );
  }

  private addTestButton(): void {
    if (process.env.NODE_ENV !== "development") return;

    const button = document.createElement("button");
    button.innerHTML = "Test AI Assistant";
    button.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 10000;
      padding: 10px 20px;
      background: #34a853;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-family: Arial, sans-serif;
    `;
    button.onclick = () => {
      const testData = {
        title:
          document.querySelector('[data-cy="question-title"]')?.textContent ||
          "Test Problem",
        description:
          document.querySelector('[data-cy="question-content"]')?.textContent ||
          "Test Description",
        platform: "leetcode",
        language: "javascript",
      };

      chrome.runtime.sendMessage({
        type: "HELP_REQUESTED",
        data: testData,
      });
    };
    document.body.appendChild(button);
  }
}

// Add spinner animation to document
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initialize content script
new ContentScript();
