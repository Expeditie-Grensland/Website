import mapboxGl from 'mapbox-gl';
import geoJson from 'geojson';

import { SocketHandler } from '../sockets/handler';
import { SocketTypes } from '../sockets/types';

export namespace MapHandler {
    const LOCATION_SOURCE = 'locations';

    export let map: mapboxGl.Map;

    const gNodes: SocketTypes.Node[] = [];
    const gLocations: SocketTypes.Location[][] = [];

    let mapStyleLoaded = false;

    export function init(mapboxMap: mapboxGl.Map) {
        map = mapboxMap;

        map.on('style.load', onMapStyleLoad);

        SocketHandler.request();
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

    export function addLocations(locations: SocketTypes.Location[]) {
        for (let location of locations)
            for (let i = 0; i < gNodes.length; i++) {
                if (gNodes[i].personIds.indexOf(location[1]) > -1 &&
                    location[2] >= gNodes[i].timeFrom &&
                    location[2] < gNodes[i].timeTill) {

                    gLocations[i].push(location);
                    break;
                }
            }

        if (mapStyleLoaded) updateMap();
    }

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
                        coordinates: gLocations[i].sort((l1, l2) => l1[2] - l2[2]).map(l => [l[4], l[3]])
                    }
                });

        return {
            type: 'FeatureCollection',
            features
        };
    }

    export function onMapStyleLoad() {
        mapStyleLoaded = true;

        // @ts-ignore
        map.addSource(LOCATION_SOURCE, { type: 'geojson', data: null });

        updateMap();
    }
}
