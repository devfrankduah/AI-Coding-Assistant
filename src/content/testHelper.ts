// Add this helper function to test the extension
function testExtension() {
  console.log('Testing AI Coding Assistant...');
  
  // Simulate problem data
  const testData = {
    title: document.querySelector('[data-cy="question-title"]')?.textContent || 'Test Problem',
    description: document.querySelector('[data-cy="question-content"]')?.textContent || 'Test Description',
    platform: 'leetcode'
  };

  // Test getting full solution
  chrome.runtime.sendMessage({
    type: 'HELP_REQUESTED',
    data: testData
  }, response => {
    console.log('Full Solution Response:', response);
  });

  // Test getting hint for selected text
  chrome.runtime.sendMessage({
    type: 'TEXT_SELECTED',
    data: {
      ...testData,
      selectedText: 'Write a function that adds two numbers'
    }
  }, response => {
    console.log('Selected Text Response:', response);
  });
}

// Export for use in content script
export { testExtension }; 