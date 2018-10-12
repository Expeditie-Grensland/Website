export namespace TileCache {

    export function init(sw: ServiceWorkerGlobalScope) {
        console.log("Initializing tile cache..");

        sw.addEventListener("fetch", ((event: FetchEvent) => {
            const url = event.request.url;

            console.log("Fetch intercepted: ");
            console.log(event.request);

            if(url.substr(0, 8) == 'https://' && (url.indexOf('tiles.mapbox.com') >= 0 || url.indexOf('api.mapbox.com') >= 0)) {
                event.respondWith(
                    caches.match(event.request).then(function(resp) {
                        return resp || fetch(event.request).then(function(response) {
                            const cacheResponse = response.clone();
                            caches.open('mapbox').then(function(cache) {
                                cache.put(event.request, cacheResponse);
                            });
                            return response;
                        });
                    })
                );
            }
        }) as EventListener);
    }
}
