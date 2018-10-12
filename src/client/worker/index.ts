import { TileCache } from './tileCache';

const sw = self as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event: ExtendableEvent) => {
    console.log('Installing Service Worker');
    event.waitUntil(sw.skipWaiting());
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(sw.clients.claim());
});

TileCache.init(sw);
