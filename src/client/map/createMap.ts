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
import {Fill, Icon, Stroke, Style, Text} from 'ol/style';
// @ts-ignore
import * as olms from 'ol-mapbox-style';

const mapboxAccessToken =
    "pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw";
const mapboxStyle =
    "mauricemeedendorp/cj9zhseph8lev2rqd3f6vsmkj";

export default function createMap(): Map {
    const map = new Map({
        target: 'map',
        view: new View({
            center: [0, 0],
            zoom: 2
        })
    });

    olms.apply(map, `https://api.mapbox.com/styles/v1/${mapboxStyle}?access_token=${mapboxAccessToken}`);

    return map;
}
