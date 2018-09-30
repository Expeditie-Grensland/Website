import mapboxGl from 'mapbox-gl';
import geoJson from 'geojson';

import { SocketHandler } from '../sockets/handler';
import { SocketTypes } from '../sockets/types';

export namespace MapHandler {
    const LOCATION_SOURCE = 'locations';

    export let map: mapboxGl.Map;

    const nodeMap: { [key: number]: SocketTypes.RouteNode } = {};
    const locationMap: { [key: number]: SocketTypes.Location } = {};
    const locationNodeMap: { [key: number]: number[] } = {}; //Map RouteNode ids to location ids.

    let mapStyleLoaded = false;

    export function init(mapboxMap: mapboxGl.Map, expeditieNameShort: string) {
        map = mapboxMap;

        map.on('style.load', onMapStyleLoad);

        SocketHandler.request(expeditieNameShort);
    }

    export function setBoundingBox(b: SocketTypes.BoundingBox) {
        const bounds = new mapboxGl.LngLatBounds();

        bounds.extend(new mapboxGl.LngLat(b.minLon, b.minLat));
        bounds.extend(new mapboxGl.LngLat(b.maxLon, b.maxLat));

        map.fitBounds(bounds, {
            padding: 20
        });
    }

    export function addNodes(nodes: SocketTypes.RouteNode[]) {
        for (let node of nodes) {
            nodeMap[node.id] = node;

            locationNodeMap[node.id] = [];

            //TODO make this one layer instead of multiple. https://www.mapbox.com/mapbox-gl-js/example/data-driven-circle-colors/
            map.addLayer({
                id: LOCATION_SOURCE + node.id,
                type: 'line',
                source: LOCATION_SOURCE,
                paint: {
                    'line-color': node.color,
                    'line-opacity': 1,
                    'line-width': 3
                },
                filter: ['==', 'node-id', node.id]
            });
        }
    }

    export function addLocations(locations: SocketTypes.Location[]) {
        for (let location of locations) {
            const nodeLocations = locationNodeMap[location[1]];

            nodeLocations.push(location[0]);

            locationMap[location[0]] = location;
            locationNodeMap[location[1]] = nodeLocations;
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

        for (let key of Object.keys(nodeMap)) {
            const node = nodeMap[<any>key];

            const coords: mapboxGl.LngLat[] = [];
            const nodeLocations = locationNodeMap[node.id]
                .map(l => locationMap[l])
                .sort((l1, l2) => l1[2] - l2[2]);

            for (let location of nodeLocations) {
                coords.push(new mapboxGl.LngLat(location[4], location[3]));
            }

            if (coords.length >= 2) {
                features.push({
                    type: 'Feature',
                    properties: {
                        'node-id': node.id
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: coords.map(coord => [coord.lng, coord.lat])
                    }
                });
            }
        }

        return {
            type: 'FeatureCollection',
            features: features
        };
    }

    export function onMapStyleLoad() {
        mapStyleLoaded = true;

        // @ts-ignore
        map.addSource(LOCATION_SOURCE, { type: 'geojson', data: null });

        updateMap();
    }
}
