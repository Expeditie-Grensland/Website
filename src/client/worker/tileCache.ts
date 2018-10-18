export namespace TileCache {
    const domains = [
        "tiles.mapbox.com",         // Mapbox tiles
        "api.mapbox.com",           // Mapbox API calls
        "assets.cesium.com"         // Cesium terrain data.
    ]

    export const init = (sw: ServiceWorkerGlobalScope) => {
        console.log('Initializing tile cache..');

        sw.addEventListener('fetch', (event: FetchEvent) => {
            const url = event.request.url;

            if (url.substr(0, 8) != 'https://' || !domains.some(domain => url.indexOf(domain) >= 0))
                return;

            event.respondWith(
                caches.open('mapdata').then(cache =>
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
