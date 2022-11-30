import 'core-js/features/promise';
import mapboxgl from 'mapbox-gl';
import $ from 'jquery'; //TODO: Reactivate for Stories

import {GeoJsonResult, StoryResult} from './helpers/retrieval';
import { ToggleLayerControl } from './map/ToggleLayerControl';
import { StoryHandler } from './story/storyHandler';
import {Point} from "geojson" //TODO: Reactivate for Stories

declare var expeditieNameShort: string;

const worker: Worker = new Worker((document.getElementById('worker') as HTMLLinkElement).href);
worker.postMessage(['retrieveAll', expeditieNameShort]);

const nodeColors = [
    '#2962ff',
    '#d50000',
    '#00c853',
    '#ff6d00',
    '#c51162',
    '#aa00ff',
    '#aeea00',
    '#00bfa5',
    '#00b8d4',
]

// @ts-ignore
worker.onmessage = (event) => {
    switch (event.data[0]) {
        case 'geoJson':
            return setRoute(event.data[1]);
        // TODO: Reactivate for Stories
        case 'story':
            if (event.data[1].story.length > 0) {
                StoryHandler.init(event.data[1], nodeColors, map);
                addStoryLayer(event.data[1])
            }
    }
};

mapboxgl.accessToken =
    'pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw';
const map = new mapboxgl.Map({
    container: 'map',
    projection: {
        name: 'globe'
    },
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [7.048, 53.0545],
    zoom: 2,
    antialias: true
});

map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.ScaleControl());
map.addControl(new ToggleLayerControl('satellite'));

// Function to reset map to original route bounds, is set after receiving bounds from server
let resetBounds: () => void = () => {};

$('.zoomout').on('click', () => {
    resetBounds()
})

const setRoute = (res: GeoJsonResult) => {
    resetBounds = () => {
        map.fitBounds(new mapboxgl.LngLatBounds(
            new mapboxgl.LngLat(res.minLon, res.minLat),
            new mapboxgl.LngLat(res.maxLon, res.maxLat)
        ), {
            padding: {
                top: 20,
                bottom: 20,
                left: $(window).width()! * 0.35 + 20,// TODO: Reactivate for Stories
                // left: 20,
                right: 20
            },
            animate: true
        });
    }

    resetBounds()

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
                0, nodeColors[0],
                1, nodeColors[1],
                2, nodeColors[2],
                3, nodeColors[3],
                4, nodeColors[4],
                5, nodeColors[5],
                6, nodeColors[6],
                7, nodeColors[7],
                8, nodeColors[8],
                '#000'
            ]
        }
    });
};

const addStoryLayer = (res: StoryResult) => {
    map.addSource('story-points', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: res.story.map(story => {
                return ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [story.longitude, story.latitude]
                    },
                    properties: {
                        title: story.type === "location" ? story.name : story.title,
                        nodeNum: story.nodeNum
                    }
                })
            })
        },
        // https://docs.mapbox.com/mapbox-gl-js/example/cluster/
        // cluster: true,
        // clusterMaxZoom: 14, // Max zoom to cluster points on
        // clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        'id': 'story-points',
        'type': 'circle',
        'source': 'story-points',
        'paint': {
            'circle-radius': [  // interpolate circle radius based on zoom level
                'interpolate',
                ['exponential', 1],
                ['zoom'],
                3, 3,
                20, 7
            ],
            'circle-stroke-width': [  // interpolate circle radius based on zoom level
                'interpolate',
                ['exponential', 1],
                ['zoom'],
                3, 2,
                20, 5
            ],
            'circle-pitch-alignment': 'map',
            'circle-color': '#ffffff',
            'circle-stroke-color': [
                'match',
                ['get', 'nodeNum'],
                0, nodeColors[0],
                1, nodeColors[1],
                2, nodeColors[2],
                3, nodeColors[3],
                4, nodeColors[4],
                5, nodeColors[5],
                6, nodeColors[6],
                7, nodeColors[7],
                8, nodeColors[8],
                '#000'
            ]
        },
    });

    // Center the map on the coordinates of any clicked circle from the 'circle' layer.
    map.on('click', 'story-points', (e) => {
        const coords = (e.features![0].geometry as Point).coordinates

        map.flyTo({
            center: [coords[0], coords[1]],
            zoom: 13
        });
    });

    // Change the cursor to a pointer when it enters a feature in the 'circle' layer.
    map.on('mouseenter', 'story-points', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'story-points', () => {
        map.getCanvas().style.cursor = '';
    });
}

map.on('load', () => {

    // Insert the 3d building layer beneath any symbol layer.
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout!['text-field']
    )!.id;

    // The 'building' layer in the Mapbox Streets
    // vector tileset contains building height data
    // from OpenStreetMap.
    map.addLayer(
        {
            'id': 'add-3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',

                // Use an 'interpolate' expression to
                // add a smooth transition effect to
                // the buildings as the user zooms in.
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        },
        labelLayerId
    );

    map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
    });
    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.25 });

    // add a star/fog layer for when zooming out or pitching map
    map.setFog({
        color: 'rgb(186, 210, 235)', // Lower atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
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
        'land-structure-polygon'
    );

    // Add satellite layer
    map.addLayer({
        id: 'satellite',
        source: {
            "type": "raster",
            "url": "mapbox://mapbox.satellite",
            "tileSize": 512
        },
        'layout': {
            // Make the layer invisible by default.
            'visibility': 'none'
        },
        type: "raster"
    }, 'tunnel-street-low');

    console.info('Map load!');
    worker.postMessage(['styleLoaded']);
});

map.on('error', (e: any) => {
    console.error('Map error: ' + e.error);
});
