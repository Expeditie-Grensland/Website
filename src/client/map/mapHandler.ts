// @ts-ignore
import binarySearchInsert from 'binary-search-insert';

import { SocketHandler } from '../sockets/handler';
import { SocketTypes } from '../sockets/types';
import { Database } from '../database';
import { DatabaseTypes } from '../database/types';

// @ts-ignore
import Map from 'ol/Map';
// @ts-ignore
import VectorLayer from 'ol/layer/Vector';
// @ts-ignore
import {Fill, Stroke, Style} from 'ol/style';
// @ts-ignore
import {Vector as VectorSource} from 'ol/source';
// @ts-ignore
import GeoJSON from 'ol/format/GeoJSON';
// @ts-ignore
import {fromLonLat} from 'ol/proj';


export namespace MapHandler {
    export interface NodeWithLayer extends SocketTypes.Node {
        layer?: VectorLayer
    }

    export let map: Map;

    const gNodes: NodeWithLayer[] = [];
    const gLocations: DatabaseTypes.Location[][] = [];

    export function init(map: Map) {
        MapHandler.map = map;
        Database.init();
        SocketHandler.init();

        Database.getLastLocationId()
            .then(SocketHandler.request)
            .catch(() => SocketHandler.request());
    }

    export function setBoundingBox(b: SocketTypes.BoundingBox) {
        console.log([b.minLon, b.minLat, b.maxLon, b.maxLat]);

        const [minX, minY] = fromLonLat(b.minLon, b.minLat);
        const [maxX, maxY] = fromLonLat(b.maxLon, b.maxLat);

        map.getView().fit(
                [minX, minY, maxX, maxY],
                {
                    padding: [20, 20, 20, 20]
                }
            );
    }

    export function addNodes(nodes: SocketTypes.Node[]) {
        for (let node of nodes) {
            const layer = new VectorLayer({
                style: new Style({
                    stroke: new Stroke({
                        color: node.color,
                        width: 3
                    })
                })
            });

            map.addLayer(layer);

            const layerNode = node as NodeWithLayer;
            layerNode.layer = layer;
            gNodes.push(layerNode);
            gLocations.push([]);
        }
    }

    export const addLocations = (locs: DatabaseTypes.Location[], forceUpdate: boolean = false) => {
        for (let location of locs)
            for (let i = 0; i < gNodes.length; i++) {
                if (gNodes[i].personIds.indexOf(location.personId) > -1 &&
                    location.time >= gNodes[i].timeFrom &&
                    location.time < gNodes[i].timeTill) {

                    gLocations[i].push(location);
                    break;
                }
            }

        updateMap();
    }

    export function updateMap() {

        for (let i = 0; i < gNodes.length; i++)
            if (gLocations[i].length > 1) {
                const source = gNodes[i].layer.getSource() || new VectorSource();

                source.clear();
                source.addFeature((new GeoJSON()).readFeature({
                    type: 'Feature',
                    geometry:   {
                        type: 'LineString',
                        coordinates: gLocations[i].sort((l1, l2) => l1.time - l2.time).map(l => fromLonLat([l.longitude, l.latitude]))
                    }
                }));

                gNodes[i].layer.setSource(source);
            }
    }
}
