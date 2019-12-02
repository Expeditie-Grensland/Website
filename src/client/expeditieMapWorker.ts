import { GeoJsonHelper } from './helpers/geoJson';

declare function postMessage(message: any): void;

let styleLoaded = false;
let geoJsonResult: (GeoJsonHelper.GeoJsonResult | null) = null;

onmessage = (event) => {
    let key = event.data[0] as string;

    if (key == "styleLoaded") {
        styleLoaded = true;
        if (geoJsonResult != null) postMessage(geoJsonResult);
    }
    else if (key == "retrieveGeoJson")
        GeoJsonHelper.retrieveGeoJson(event.data[1], (res: (GeoJsonHelper.GeoJsonResult)) => {
            if (styleLoaded) return postMessage(res);
            geoJsonResult = res;
        });
};
