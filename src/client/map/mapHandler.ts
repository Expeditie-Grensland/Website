import mapboxGl from 'mapbox-gl';
import geoJson from 'geojson';

import { SocketHandler } from '../sockets/handler';
import { SocketTypes } from '../sockets/types';
import { DatabaseModel } from '../database/model';
import { Database } from '../database';
import { DatabaseTypes } from '../database/types';

export namespace MapHandler {
    const LOCATION_SOURCE = 'locations';

    export let map: mapboxGl.Map;

    const gNodes: SocketTypes.Node[] = [];
    const gLocations: DatabaseTypes.Location[][] = [];

    let lastUpdated = 0;

    export function init(mapboxMap: mapboxGl.Map) {
        map = mapboxMap;

        map.on('style.load', onMapStyleLoad);

        Database.init();
        SocketHandler.init();

        Database.getLastLocationId()
            .then(SocketHandler.request)
            .catch(() => SocketHandler.request());
    }

    export function setBoundingBox(b: SocketTypes.BoundingBox) {
        const bounds = new mapboxGl.LngLatBounds();

        bounds.extend(new mapboxGl.LngLat(b.minLon, b.minLat));
        bounds.extend(new mapboxGl.LngLat(b.maxLon, b.maxLat));

        map.fitBounds(bounds, {
            padding: 20
        });
    }

    export function addNodes(nodes: SocketTypes.Node[]) {
        for (let node of nodes) {
            const nodeId = gNodes.push(node) - 1;
            gLocations.push([]);

            // TODO make this one layer instead of multiple. https://www.mapbox.com/mapbox-gl-js/example/data-driven-circle-colors/
            map.addLayer({
                id: LOCATION_SOURCE + nodeId,
                type: 'line',
                source: LOCATION_SOURCE,
                paint: {
                    'line-color': node.color,
                    'line-opacity': 1,
                    'line-width': 3
                },
                filter: ['==', 'node-id', nodeId]
            });
        }
    }

    export const addLocations = (locs: DatabaseTypes.Location[], forceUpdate: boolean = false) => {
        for (let loc of locs)
            for (let i = 0; i < gNodes.length; i++)
                if (gNodes[i].personIds.indexOf(loc.personId) > -1 &&
                    loc.time >= gNodes[i].timeFrom &&
                    loc.time < gNodes[i].timeTill) {

                    gLocations[i].push(loc);
                    break;
                }

        if (lastUpdated > 0 && (forceUpdate || Date.now() - lastUpdated > 2000)) {
            lastUpdated = Date.now();
            updateMap();
        }
    };

    export function updateMap() {
        const locationSource = map.getSource(LOCATION_SOURCE) as mapboxGl.GeoJSONSource;

        const locationsGeoJSON = generateLocationsGeoJSON();

        locationSource.setData(locationsGeoJSON);
    }

    export function generateLocationsGeoJSON(): geoJson.FeatureCollection<geoJson.LineString> {
        const features: geoJson.Feature<geoJson.LineString>[] = [];

        for (let i = 0; i < gNodes.length; i++)
            if (gLocations[i].length > 1)
                features.push({
                    type: 'Feature',
                    properties: {
                        'node-id': i
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: gLocations[i]
                            .sort((l1, l2) => l1.time - l2.time)
                            .map(l => [l.longitude, l.latitude])
                    }
                });

        return {
            type: 'FeatureCollection',
            features
        };
    }

    export function onMapStyleLoad() {
        lastUpdated = Date.now();

        // @ts-ignore
        map.addSource(LOCATION_SOURCE, { type: 'geojson', data: null });

        updateMap();
    }
}
