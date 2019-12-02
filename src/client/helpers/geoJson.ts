import geoJson from 'geojson';

export namespace GeoJsonHelper {
    export const retrieveGeoJson = (expeditie: string, cb: (res: GeoJsonResult) => void) =>
        retrieveBinary(expeditie, (buf) => cb(binaryToGeoJson(buf)));


    const retrieveBinary = (expeditie: string, cb: (buf: ArrayBuffer) => void) => {
        const req = new XMLHttpRequest();
        req.open('GET', '/' + expeditie + '/kaart/binary', true);
        req.responseType = 'arraybuffer';

        req.onload = (event) => {
            const buf = req.response;

            cb(buf);
        };

        req.send(null);
    };

    export type GeoJsonResult = {
        geoJson: geoJson.FeatureCollection<geoJson.LineString>,
        minLon: number, maxLon: number,
        minLat: number, maxLat: number
    }

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
        console.log("nodeCount: ", nodeCount);
        let offset = 4;

        for (let nodeNum = 0; nodeNum < nodeCount; nodeNum++) {
            const locCount = view.getInt32(offset);
            console.log("locCount: ", locCount);

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
