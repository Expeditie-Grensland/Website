// @ts-ignore
import Map from 'ol/Map';
// @ts-ignore
import View from 'ol/View';
// @ts-ignore
import TileLayer from 'ol/layer/Tile';
// @ts-ignore
import OSM from 'ol/source/OSM';
// @ts-ignore
import XYZ from 'ol/source/XYZ';
// @ts-ignore
import MVT from 'ol/format/MVT';
// @ts-ignore
import VectorTileLayer from 'ol/layer/VectorTile';
// @ts-ignore
import VectorTileSource from 'ol/source/VectorTile';
// @ts-ignore
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
// @ts-ignore
import OLCesium from 'olcs/OLCesium';
// @ts-ignore
import * as olms from 'ol-mapbox-style';

declare const Cesium: any;

const mapboxAccessToken =
    'pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw';
const mapboxStyle =
    'mauricemeedendorp/cj9zhseph8lev2rqd3f6vsmkj';
const cesiumAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNjBjYzlkNy0wMjc5LTRlOTQtYjAyOS01MjU1ZWQ5NjUyOWMiLCJpZCI6NDA5NSwic2NvcGVzIjpbImFzci' +
    'IsImdjIl0sImlhdCI6MTUzOTg2NTU5NX0.NWLVr2L9Z8l-ogaGVWURKjFsJYfgGq_C_wMv1utumfk';

export function createMap(vectorSource: boolean, useCesium: boolean, showTerrain: boolean): Map {
    const map = new Map({
        target: 'map',
        view: new View({
            center: [0, 0],
            zoom: 2
        })
    });

    if (vectorSource) {
        olms.apply(map, `https://api.mapbox.com/styles/v1/${mapboxStyle}?access_token=${mapboxAccessToken}`);
    } else {
        map.addLayer(
            new TileLayer({
                source: new XYZ({
                    tileSize: [512, 512],
                    tilePixelRatio: 2,
                    url: `https://api.mapbox.com/styles/v1/${mapboxStyle}/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxAccessToken}`
                })
            })
        );
    }

    if (useCesium) {
        console.log('Loading cesium..');

        Cesium.Ion.defaultAccessToken = cesiumAccessToken;

        const ol3d = new OLCesium({ map: map });

        if (showTerrain) {
            const scene = ol3d.getCesiumScene();
            scene.terrainProvider = Cesium.createWorldTerrain({
                requestVertexNormals: true
            });
        }

        ol3d.setEnabled(true);
    }

    return map;
}
