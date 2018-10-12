/// <reference path='../../node_modules/typescript/lib/lib.es5.d.ts' />
/// <reference path='../../node_modules/typescript/lib/lib.webworker.d.ts' />
//import {TileCache} from "./worker/tileCache"
self.addEventListener('install', function (event) {
    console.log('Installing Service Worker');
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});
//TileCache.init(self)
