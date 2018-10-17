import $ from 'jquery';
import {LoadingBar} from './map/loadingBar';
import {registerWorker} from './workerHelper/register';
// @ts-ignore
import {Map, View} from 'ol';
// @ts-ignore
import TileLayer from 'ol/layer/Tile';
// @ts-ignore
import OSM from 'ol/source/OSM';
// @ts-ignore
import XYZ from 'ol/source/XYZ';
// @ts-ignore
import OLCesium from 'olcs/OLCesium';

// @ts-ignore
declare var expeditieNameShort: string;

$(() => {
    registerWorker();

    LoadingBar.setLoadingText('Loading map...');

    const accessToken =
        'pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw';

    const map = new Map({
        layers: [
            new TileLayer({
                source: new XYZ({
                    url: 'https://api.mapbox.com/styles/v1/mauricemeedendorp/cj9zhseph8lev2rqd3f6vsmkj/tiles/256/{z}/{x}/{y}@2x?access_token=' + accessToken
                }),
            })
        ],
        target: 'map',
        view: new View({
            center: [0, 0],
            zoom: 2
        })
    });

    const ol3d = new OLCesium({map: map});
    ol3d.setEnabled(true);

    //SocketHandler.init();
    //MapHandler.init(map, expeditieNameShort);
});
