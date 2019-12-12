import { GeoJsonResult, RetrievalHelper } from './helpers/retrieval';

declare function postMessage(message: any): void;

let styleLoaded = false;
let geoJsonResult: (GeoJsonResult | null) = null;

onmessage = (event) => {
    let key = event.data[0] as string;

    if (key == "styleLoaded") {
        styleLoaded = true;
        if (geoJsonResult != null) postMessage(['geoJson', geoJsonResult]);
    }
    else if (key == "retrieveAll") {
        RetrievalHelper.retrieveGeoJson(event.data[1], (res: (GeoJsonResult)) => {
            if (styleLoaded) return postMessage(['geoJson', res]);
            geoJsonResult = res;
        });
        // TODO: Reactivate for Stories
        // RetrievalHelper.retrieveStory(event.data[1], (res: JSON) => {
        //     return postMessage(['story', res]);
        // })
    }
};
