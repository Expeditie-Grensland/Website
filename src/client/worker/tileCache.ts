export namespace TileCache {
    export const init = (sw: ServiceWorkerGlobalScope) => {
        console.log('Initializing tile cache..');

        sw.addEventListener('fetch', (event: FetchEvent) => {
            const url = event.request.url;

            if (!(url.substr(0, 8) == 'https://' && (url.indexOf('tiles.mapbox.com') >= 0 || url.indexOf('api.mapbox.com') >= 0)))
                return;

            event.respondWith(
                caches.open('mapbox').then(cache =>
                    cache.match(event.request).then(cacheResponse =>
                        cacheResponse || fetch(event.request).then(response => {
                            cache.put(event.request, response.clone());
                            return response;
                        })
                    )
                )
            );
        });
    };
}
