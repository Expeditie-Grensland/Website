// @ts-ignore
import Map from 'ol/Map';
// @ts-ignore
import View from 'ol/View';
// @ts-ignore
import {Fill, Icon, Stroke, Style, Text} from 'ol/style';
// @ts-ignore
import olms from 'ol-mapbox-style/olms';

const mapboxAccessToken =
    "pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw";
const mapboxStyle =
    "mauricemeedendorp/cj9zhseph8lev2rqd3f6vsmkj";

export function createMap(): Map {
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
