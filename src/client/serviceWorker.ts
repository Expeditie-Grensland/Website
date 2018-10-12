/// <reference path='../../node_modules/typescript/lib/lib.es5.d.ts' />
/// <reference path='../../node_modules/typescript/lib/lib.webworker.d.ts' />

declare var self: ServiceWorkerGlobalScope;


//import {TileCache} from "./worker/tileCache"

self.addEventListener('install', (event: ExtendableEvent) => {
    console.log('Installing Service Worker');
    event.waitUntil(self.skipWaiting());
})

self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(self.clients.claim());
})

//TileCache.init(self)
