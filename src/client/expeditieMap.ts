import 'core-js/fn/promise';

import mapboxgl from 'mapbox-gl';
// @ts-ignore
import { GeoJsonHelper } from './helpers/geoJson';

declare var expeditieNameShort: string;

const worker: Worker = new Worker((document.getElementById('worker') as HTMLLinkElement).href);
worker.postMessage(['retrieveGeoJson', expeditieNameShort]);

// @ts-ignore
worker.onmessage = (event) => {
    setRoute(event.data);
    worker.terminate();
};

mapboxgl.accessToken =
    'pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mauricemeedendorp/cj9zhseph8lev2rqd3f6vsmkj?optimize=true',
    center: [7.048, 53.0545],
    zoom: 18
});

map.addControl(new mapboxgl.NavigationControl());

const setRoute = (res: GeoJsonHelper.GeoJsonResult) => {
    map.fitBounds(new mapboxgl.LngLatBounds(
        new mapboxgl.LngLat(res.minLon, res.minLat),
        new mapboxgl.LngLat(res.maxLon, res.maxLat)
    ), { padding: 20, animate: false });

    map.addSource('exp-route', { type: 'geojson', data: res.geoJson } as any);

    map.addLayer({
        id: 'exp-route',
        type: 'line',
        source: 'exp-route',
        paint: {
            'line-opacity': 1,
            'line-width': 3,
            'line-color': [
                'match',
                ['get', 'nodeNum'],
                0, '#2962ff',
                1, '#d50000',
                2, '#00c853',
                3, '#ff6d00',
                4, '#c51162',
                5, '#aa00ff',
                6, '#aeea00',
                7, '#00bfa5',
                8, '#00b8d4',
                '#000'
            ]
        }
    });
};


map.on('load', () => {
    console.info('Map load!');
    worker.postMessage(['styleLoaded']);
});

map.on('error', (e: any) => {
    console.error('Map error: ' + e.error);
});
