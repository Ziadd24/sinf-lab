// Service Worker for SINF-VET - Enables offline functionality
// This file enables the PWA to work offline and cache important data

const CACHE_VERSION = 'sinf-vet-v1.0.0';
const RUNTIME_CACHE = 'sinf-vet-runtime';
const IMAGES_CACHE = 'sinf-vet-images';
const API_CACHE = 'sinf-vet-api';

// Files to cache on first install
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/offline.html',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(STATIC_ASSETS);
      console.log('[Service Worker] Static assets cached');
      self.skipWaiting(); // Activate immediately
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        if (cacheName !== CACHE_VERSION && !cacheName.includes('runtime')) {
          await caches.delete(cacheName);
          console.log(`[Service Worker] Deleted old cache: ${cacheName}`);
        }
      }
      self.clients.claim(); // Take control of all clients immediately
    })()
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(handleApiRequest(event.request));
  }

  // Handle images
  if (event.request.destination === 'image') {
    return event.respondWith(handleImageRequest(event.request));
  }

  // Handle everything else (HTML, CSS, JS)
  event.respondWith(handlePageRequest(event.request));
});

// Handle API requests - network first, cache fallback
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful API responses
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request.url, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] API offline, using cache:', request.url);
    
    // Return cached version if available
    const cached = await caches.match(request.url);
    if (cached) {
      return cached;
    }

    // Return offline response
    return new Response(
      JSON.stringify({ error: 'Offline - cached data not available' }),
      { 
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle image requests - cache first, network fallback
async function handleImageRequest(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(IMAGES_CACHE);
      cache.put(request.url, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder for missing images
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f0f0f0" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#999">Image unavailable</text></svg>',
      { 
        headers: { 'Content-Type': 'image/svg+xml' },
        status: 200
      }
    );
  }
}

// Handle page requests - cache first, network fallback
async function handlePageRequest(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Try to update in background
    fetch(request).then((response) => {
      if (response.ok) {
        const cache = caches.open(CACHE_VERSION);
        cache.then((c) => c.put(request, response.clone()));
      }
    }).catch(() => {
      // Silently fail background update
    });
    
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request.url, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Offline:', request.url);
    
    // Return offline page if it exists
    return caches.match('/offline.html')
      || new Response(
        '<!DOCTYPE html><html><body><h1>Offline</h1><p>You are offline. Some features are not available.</p></body></html>',
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 200
        }
      );
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.ports[0].postMessage({
      type: 'CACHE_STATUS',
      size: 0, // Would need to calculate actual size
      timestamp: new Date().toISOString()
    });
  }
});

// Handle sync events (background sync)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-results') {
    event.waitUntil(syncResults());
  }
});

async function syncResults() {
  try {
    // This will be called when network is available
    // Could sync offline-entered data to server
    console.log('[Service Worker] Syncing results...');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

console.log('[Service Worker] Loaded and ready');
