import 'core-js/features/promise';
import mapboxgl from 'mapbox-gl';
// import $ from 'jquery'; TODO: Reactivate for Stories

import { GeoJsonResult } from './helpers/retrieval';
// import { StoryHandler } from './story/storyHandler'; TODO: Reactivate for Stories

declare var expeditieNameShort: string;

const worker: Worker = new Worker((document.getElementById('worker') as HTMLLinkElement).href);
worker.postMessage(['retrieveAll', expeditieNameShort]);

// @ts-ignore
worker.onmessage = (event) => {
    switch (event.data[0]) {
        case 'geoJson':
            return setRoute(event.data[1]);
        // TODO: Reactivate for Stories
        // case 'story':
        //     return StoryHandler.init(event.data[1]);
    }
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

const setRoute = (res: GeoJsonResult) => {
    map.fitBounds(new mapboxgl.LngLatBounds(
        new mapboxgl.LngLat(res.minLon, res.minLat),
        new mapboxgl.LngLat(res.maxLon, res.maxLat)
    ), {
        padding: {
            top: 20,
            bottom: 20,
            // left: $(window).width()! * 0.35 + 20, TODO: Reactivate for Stories
            left: 20,
            right: 20
        },
        animate: false
    });

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
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });
    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.25 });

    // add a sky layer that will show when the map is highly pitched
    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });

    // Add hillshade layer
    map.addLayer({
            'id': 'hillshading',
            'source': 'mapbox-dem',
            'type': 'hillshade',
            'paint': {
                'hillshade-exaggeration': .2
            }
        },
        // insert before waterway-river-canal-shadow;
        // where hillshading sits in the Mapbox outdoors style
        'waterway-river-canal-shadow'
    );


    console.info('Map load!');
    worker.postMessage(['styleLoaded']);
});

map.on('error', (e: any) => {
    console.error('Map error: ' + e.error);
});
