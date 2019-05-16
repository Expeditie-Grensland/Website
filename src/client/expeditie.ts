import 'core-js/fn/promise';

import mapboxgl from 'mapbox-gl';
// @ts-ignore
import MapboxLanguage from '@mapbox/mapbox-gl-language';

import { LoadingBar } from './map/loadingBar';
import { MapHandler } from './map/mapHandler';
import { ready } from './helpers/ready';
import {Graph} from "./story/graph"
import {StoryHandler} from "./story/handler"

ready(() => {
    LoadingBar.setLoadingText('Kaart laden..');

    mapboxgl.accessToken =
        'pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mauricemeedendorp/cj9zhseph8lev2rqd3f6vsmkj?optimize=true',
        center: [5.84357, 52.268337],
        zoom: 6
    });

    mapboxgl.setRTLTextPlugin(
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.0/mapbox-gl-rtl-text.js',
        () => {
        }
    );

    map.addControl(new mapboxgl.NavigationControl());

    map.on('style.load', () => {
        const mapLanguage = new MapboxLanguage();
        const browserLanguage = (navigator.languages ? navigator.languages[0] : navigator.language).split('-')[0];

        //There's a bug in MapboxLanguage that crashes if the browser language is a non-supported language.
        if (mapLanguage.supportedLanguages.indexOf(browserLanguage) < 0) {
            mapLanguage._defaultLanguage = 'en';

            console.log('Browser language not supported by mapbox. Switching to English.');
        }

        map.addControl(mapLanguage);
    });

    map.on('load', () => {
        console.log('Map load!');
    });

    map.on('error', (e: any) => {
        console.error('Map error: ' + e.error);
    });

   // Graph.init();
    MapHandler.init(map);

    const storyWrapper = <HTMLDivElement>document!.getElementById("storyWrapper");

    if(storyWrapper != null)
        StoryHandler.init(storyWrapper);
});
