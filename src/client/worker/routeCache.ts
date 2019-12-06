export namespace RouteCache {
    export const onFetch = (event: FetchEvent): boolean => {
        if (/^https?:\/\/.*\/(.*)\/kaart\/binary$/u.exec(event.request.url)) {
            event.respondWith(getFromCacheAndRequest(event, 'X-Location-Count', 'X-Last-Location'));
            return true;
        }

        if (/^https?:\/\/.*\/(.*)\/kaart\/story$/u.exec(event.request.url)) {
            event.respondWith(getFromCacheAndRequest(event, 'X-Story-Count', 'X-Last-Story'));
            return true;
        }

        return false;
    };

    const getFromCacheAndRequest = (event: FetchEvent, ...headerKeys: string[]): Promise<Response> =>
        caches.open('routes').then(cache => cache.match(event.request).then(cacheResponse => {
            let request = event.request;

            if (cacheResponse != undefined && cacheResponse.status == 200) {
                const headers = new Headers(event.request.headers);

                headerKeys.forEach(key => {
                    headers.set(key, cacheResponse.headers.get(key) as string)
                });

                request = new Request(event.request, { headers });
            }

            return fetch(request).then(response => {
                if (response.status != 200 && cacheResponse != undefined)
                    return cacheResponse;

                if (response.status == 200 && !headerKeys.reduce((acc, key) => acc || response.headers.get(key) == null, false))
                    cache.put(event.request, response.clone());

                return response;
            })
        }));
}
