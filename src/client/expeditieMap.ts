import 'core-js/fn/promise';
import mapboxgl from 'mapbox-gl';
import $ from 'jquery';
import geoJson from 'geojson';
import {GeoJsonResult, StoryElement, Node, GeoJsonProperties, StoryResult} from './helpers/retrieval';
import {StoryHandler} from "./story/storyHandler";

declare var expeditieNameShort: string;

const worker: Worker = new Worker((document.getElementById('worker') as HTMLLinkElement).href);
worker.postMessage(['retrieveAll', expeditieNameShort]);

// @ts-ignore
worker.onmessage = (event) => {
    switch (event.data[0]) {
        case 'geoJson':
            return setRoute(event.data[1]);
        case 'story': {
            StoryHandler.init(event.data[1]);
            return addStories(event.data[1]);
        }
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

const addStories = (result: StoryResult) => {
    const collection: geoJson.FeatureCollection<geoJson.MultiPoint, GeoJsonProperties> = {
        type: 'FeatureCollection',
        features: []
    };

    for (const node of result.nodes) {
        const elements = result.story.filter(element => element.nodeNum === node.nodeNum)

        const feat: geoJson.Feature<geoJson.MultiPoint, GeoJsonProperties> = {
            id: node.nodeNum,
            type: 'Feature',
            properties: {
                color: node.color,
                nodeNum: node.nodeNum
            },
            geometry: { type: 'MultiPoint', coordinates: [] }
        };

        for (const element of elements) {
            feat.geometry.coordinates.push([element.location.longitude, element.location.latitude])
        }

        collection.features.push(feat)
    }

    map.addSource('exp-story', {type: 'geojson', data: collection} as any)

    map.addLayer({
        id: 'exp-story',
        type: 'circle',
        source: 'exp-story',
        paint: {
            'circle-radius': 3,
            'circle-color': "#ffffff",
            'circle-pitch-alignment': 'map',
            'circle-stroke-width': 3,
            'circle-stroke-color': ['get', 'color'],
        }
    })
}

const setRoute = (res: GeoJsonResult) => {
    map.fitBounds(new mapboxgl.LngLatBounds(
        new mapboxgl.LngLat(res.minLon, res.minLat),
        new mapboxgl.LngLat(res.maxLon, res.maxLat)
    ), {
        padding: {
            top: 20,
            bottom: 20,
            left: $(window).width()! * 0.35 + 20,
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
            'line-color': ['get', 'color']
        }
    });

    // Move story layer to top
    const storyLayer = map.getLayer('exp-story')

    if (storyLayer != null)
        map.moveLayer(storyLayer.id)
};

map.on('load', () => {
    console.info('Map load!');
    worker.postMessage(['styleLoaded']);
});

map.on('error', (e: any) => {
    console.error('Map error: ' + e.error);
});
