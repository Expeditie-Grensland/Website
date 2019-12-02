export namespace RouteCache {
    export const onFetch = (event: FetchEvent): boolean => {
        const match = /^https?:\/\/.*\/(.*)\/kaart\/binary$/u.exec(event.request.url);

        if (!match)
            return false;

        event.respondWith(getFromCacheAndRequest(event));
        return true;
    };

    const H_LC = 'X-Location-Count';
    const H_LL = 'X-Last-Location';

    const getFromCacheAndRequest = (event:FetchEvent): Promise<Response> =>
        caches.open('routes').then(cache => cache.match(event.request).then(cacheResponse => {
            let request = event.request;

            if (cacheResponse != undefined && cacheResponse.status == 200) {
                const headers = new Headers(event.request.headers);
                headers.set(H_LC, cacheResponse.headers.get(H_LC) as string);
                headers.set(H_LL, cacheResponse.headers.get(H_LL) as string);

                request = new Request(event.request, { headers });
            }

            return fetch(request).then(response => {
                if (response.status != 200 && cacheResponse != undefined)
                    return cacheResponse;

                if (response.status == 200 && response.headers.get(H_LC) != null && response.headers.get(H_LL) != null)
                    cache.put(event.request, response.clone());

                return response;
            })
        }));
}
