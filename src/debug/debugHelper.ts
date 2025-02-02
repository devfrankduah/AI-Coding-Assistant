export function debugServiceWorker() {
  // Check if service worker is registered
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Worker Registrations:', registrations);
  });

  // Check extension runtime status
  if (chrome.runtime && chrome.runtime.id) {
    console.log('Extension Runtime ID:', chrome.runtime.id);
  } else {
    console.error('Extension Runtime not available');
  }
} 