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

import {SocketHandler} from '../sockets/handler';
import {SocketTypes} from '../sockets/types';

export namespace MapHandler {
    export interface NodeWithLayer extends SocketTypes.Node {
        layer?: VectorLayer
    }

    export let map: Map;

    const gNodes: NodeWithLayer[] = [];
    const gLocations: SocketTypes.Location[][] = [];

    export function init(map: Map, expeditieNameShort: string) {
        MapHandler.map = map;

        SocketHandler.request(expeditieNameShort);
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
                        coordinates: gLocations[i].sort((l1, l2) => l1[2] - l2[2]).map(l => fromLonLat([l[4], l[3]]))
                    }
                }));

                gNodes[i].layer.setSource(source);
            }


    }
}
