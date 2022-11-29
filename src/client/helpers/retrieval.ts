import geoJson from 'geojson';


export type GeoJsonResult = {
    geoJson: geoJson.FeatureCollection<geoJson.LineString>,
    minLon: number, maxLon: number,
    minLat: number, maxLat: number
}

export interface Node {
    id: string, // TODO: should not be necessary
    nodeNum: number,
    timeFrom: number,
    timeTill: number,
    personNames: string[]
}

interface BaseStoryElement {
    id: string, // TODO: should not be necessary
    nodeNum: number,
    dateTime: {
        stamp: number,
        zone: string
    },
    latitude: number,
    longitude: number
}

export interface TextStoryElement extends BaseStoryElement {
    type: 'text',
    title: string,
    text: string
}

export interface LocationStoryElement extends BaseStoryElement {
    type: 'location',
    name: string
}

export type StoryElement = TextStoryElement | LocationStoryElement;

export interface StoryResult {
    nodes: Node[],
    story: StoryElement[],
    finished: boolean
}

export namespace RetrievalHelper {
    export const retrieveGeoJson = (expeditie: string, cb: (res: GeoJsonResult) => void) =>
        retrieveBinary(expeditie, (buf) => cb(binaryToGeoJson(buf)));

    const retrieveBinary = (expeditie: string, cb: (buf: ArrayBuffer) => void) => {
        const req = new XMLHttpRequest();
        req.open('GET', '/' + expeditie + '/kaart/binary', true);
        req.responseType = 'arraybuffer';

        req.onload = () => {
            const buf = req.response;

            cb(buf);
        };

        req.send();
    };

    export const retrieveStory = (expeditie: string, cb: (json: JSON) => void) => {
        const req = new XMLHttpRequest();
        req.open('GET', '/' + expeditie + '/kaart/story', true);
        req.responseType = 'json';

        req.onload = () => {
            const json = req.response;

            cb(json);
        };

        req.send()
    };

    const binaryToGeoJson = (buf: ArrayBuffer): GeoJsonResult => {
        const res: GeoJsonResult = {
            geoJson: {
                type: 'FeatureCollection',
                features: []
            },
            minLon: Infinity, maxLon: -Infinity,
            minLat: Infinity, maxLat: -Infinity
        };

        const view = new DataView(buf);

        const nodeCount = view.getInt32(0);
        let offset = 4;

        for (let nodeNum = 0; nodeNum < nodeCount; nodeNum++) {
            const locCount = view.getInt32(offset);

            offset += 4;

            const feat: geoJson.Feature<geoJson.LineString> = {
                type: 'Feature',
                properties: { nodeNum },
                geometry: { type: 'LineString', coordinates: [] }
            };

            for (let i = 0; i < locCount; ++i) {
                const lon = view.getFloat64(offset);
                const lat = view.getFloat64(offset + 8);

                offset += 16;

                feat.geometry.coordinates.push([lon, lat]);

                if (lon < res.minLon) res.minLon = lon;
                if (lon > res.maxLon) res.maxLon = lon;
                if (lat < res.minLat) res.minLat = lat;
                if (lat > res.maxLat) res.maxLat = lat;
            }

            res.geoJson.features.push(feat);
        }

        return res;
    };
}
