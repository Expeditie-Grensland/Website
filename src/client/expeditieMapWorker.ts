import {GeoJsonResult, retrieveGeoJson, retrieveStory, StoryResult} from './helpers/retrieval';

declare function postMessage(message: any): void;

let styleLoaded = false;
let geoJsonResult: (GeoJsonResult | null) = null;
let storyResult: (StoryResult | null) = null;

onmessage = (event) => {
    const key = event.data[0] as string;

    if (key == "styleLoaded") {
        styleLoaded = true;
        if (geoJsonResult != null) postMessage(['geoJson', geoJsonResult]);
        if (storyResult != null) postMessage(['story', storyResult]);
    }
    else if (key == "retrieveAll") {
        retrieveGeoJson(event.data[1], (res: (GeoJsonResult)) => {
            if (styleLoaded) return postMessage(['geoJson', res]);
            geoJsonResult = res;
        });
        retrieveStory(event.data[1], (res: StoryResult) => {
            if (styleLoaded) return postMessage(['story', res]);
            storyResult = res;
        })
    }
};
