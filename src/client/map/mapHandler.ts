import $ from 'jquery';
import mapboxGl from 'mapbox-gl';
import geoJson from 'geojson';
// @ts-ignore
import binarySearchInsert from 'binary-search-insert';

import { SocketHandler } from '../sockets/handler';
import { SocketTypes } from '../sockets/types';
import { Database } from '../database';
import { DatabaseTypes } from '../database/types';

export namespace MapHandler {
    const LOCATION_SOURCE = 'locations';

    export let map: mapboxGl.Map;

    let nodesN = 0;
    const geoInfo: geoJson.FeatureCollection<geoJson.LineString> = {
        type: 'FeatureCollection',
        features: []
    };

    let lastUpdated = 0;

    export function init(mapboxMap: mapboxGl.Map) {
        map = mapboxMap;

        map.on('style.load', onMapStyleLoad);

        Database.init();
        SocketHandler.init();

        Database.getLastUpdateTime()
            .then(SocketHandler.request)
            .catch(() => SocketHandler.request());
    }

    export function setBoundingBox(b: SocketTypes.BoundingBox) {
        const bounds = new mapboxGl.LngLatBounds();

        bounds.extend(new mapboxGl.LngLat(b.minLon, b.minLat));
        bounds.extend(new mapboxGl.LngLat(b.maxLon, b.maxLat));

        map.fitBounds(bounds, {
            padding: {
                top: 20,
                bottom: 20,
                left: $(window).width()! * 0.35,
                right: 20
            }
        });
    }

    export function addNodes(nodes: SocketTypes.Node[]) {
        for (let node of nodes) {
            const nodeId = nodesN++;
            geoInfo.features.push({
                type: 'Feature',
                properties: {
                    nodeId,
                    node
                },
                geometry: {
                    type: 'LineString',
                    coordinates: []
                }
            });

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
                filter: ['==', 'nodeId', nodeId]
            });


        }
    }

    const compareCoordinates = (a: number[], b: number[]) => a[3] - b[3];

    export const addLocations = (locs: DatabaseTypes.Location[], forceUpdate: boolean = false) => {
        for (let loc of locs)
            for (let feat of geoInfo.features) {
                const node: SocketTypes.Node = feat.properties && feat.properties.node;
                if (node &&
                    node.personIds.indexOf(loc.personId) > -1 &&
                    loc.time >= node.timeFrom &&
                    loc.time < node.timeTill) {

                    binarySearchInsert(feat.geometry.coordinates, compareCoordinates, [loc.longitude, loc.latitude, 0, loc.time]);
                    break;
                }
            }

        if (lastUpdated > 0 && (forceUpdate || Date.now() - lastUpdated > 2000)) {
            lastUpdated = Date.now();
            updateMap();
        }
    };

    export const updateMap = () =>
        (<mapboxGl.GeoJSONSource>map.getSource(LOCATION_SOURCE)).setData(geoInfo);

    const onMapStyleLoad = () => {
        lastUpdated = Date.now();
        map.addSource(LOCATION_SOURCE, { type: 'geojson', data: geoInfo });
    }
}
