/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

console.log('[ServiceWorker] Loading service worker...');

// Import the background script
import { BackgroundScript } from './background';

// Create and initialize the background script
const background = new BackgroundScript();

// Basic service worker lifecycle events
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(self.clients.claim());
});

// Export the background instance
export default background; 