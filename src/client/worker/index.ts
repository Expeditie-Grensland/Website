import * as RouteCache from './routeCache';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event: ExtendableEvent) => {
    console.info('Installing service worker');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
    console.info('Kicking out old service handler');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event: FetchEvent) => {
    RouteCache.onFetch(event);
});
