// Service Worker for Legacy Trust Bank PWA - DEVELOPMENT MODE
// This service worker clears all caches to prevent development issues

// Clear all caches immediately
self.addEventListener('install', function(event) {
  console.log('SW: Clearing all caches for development');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('SW: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.skipWaiting();
});

// Always fetch from network (no caching during development)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request.clone()).catch(function() {
      // Only use cache as absolute fallback
      return caches.match(event.request);
    })
  );
});

// Activate immediately and clear all caches
self.addEventListener('activate', function(event) {
  console.log('SW: Activating and clearing all caches');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('SW: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  return self.clients.claim();
});

console.log('SW: Development mode - caching disabled');