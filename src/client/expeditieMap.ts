import 'core-js/fn/promise';
import mapboxgl, {Point} from 'mapbox-gl';
import $ from 'jquery';
import geoJson from 'geojson';
import {GeoJsonProperties, GeoJsonResult, StoryResult} from './helpers/retrieval';
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
    const collection: geoJson.FeatureCollection<geoJson.Point, GeoJsonProperties> = {
        type: 'FeatureCollection',
        features: []
    };

    let idx = 0       // FIXME does not work when stories arrive in multiple batches (which is technically supported but not used)
    for (const element of result.story) {
        const node = result.nodes.find(node => node.nodeNum === element.nodeNum)!

        collection.features.push({
            id: idx,        // Can't be element.id because an id string should resolve to an integer
            type: 'Feature',
            properties: {
                color: node.color,
                nodeNum: element.nodeNum,
            },
            geometry: {
                type: 'Point',
                coordinates: [element.location.longitude, element.location.latitude]
            }
        })
        ++idx
    }

    map.addSource('exp-story', {type: 'geojson', data: collection} as any)

    map.addLayer({
        id: 'exp-story',
        type: 'circle',
        source: 'exp-story',
        paint: {
            'circle-radius': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                10,
                3
            ],
            'circle-color': "#ffffff",
            'circle-pitch-alignment': 'map',
            'circle-stroke-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                5,
                3
            ],
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

let hoveredStoryElementId: string | number | undefined = undefined
let selectedStoryElementId: string | number | undefined = undefined

// When the user moves their mouse over the state-fill layer, we'll update the
// feature state for the feature under the mouse.
map.on('mousemove', 'exp-story', (e) => {
    if (e.features && e.features.length > 0) {

        if (e.features[0].id != null) {
            const next = e.features[0].id
            const prev = selectedStoryElementId == e.features[0].id ? undefined : hoveredStoryElementId

            if (next !== hoveredStoryElementId) {
                setHoverState(e.features[0].id, prev)
                hoveredStoryElementId = e.features[0].id
            }
        }

        map.getCanvas().style.cursor = e.features!.length ? 'pointer' : '';
    }
});

// When the mouse leaves the state-fill layer, update the feature state of the
// previously hovered feature.
map.on('mouseleave', 'exp-story', () => {
    if (hoveredStoryElementId && hoveredStoryElementId !== selectedStoryElementId) {
        map.setFeatureState(
            { source: 'exp-story', id: hoveredStoryElementId },
            { hover: false }
        );
    }
    hoveredStoryElementId = undefined;
    map.getCanvas().style.cursor = '';
});

map.on('click', 'exp-story', (e) => {
    if (e.features == null)
        return
    if (e.features.length > 0) {
        const coordinates = (<geoJson.Point>e.features[0].geometry).coordinates.slice();

        const zoomLevel = map.getZoom() > 12 ? map.getZoom() : 12

        map.flyTo({center: [coordinates[0], coordinates[1]], zoom: zoomLevel, offset: [window.innerWidth / 6, 0]});

        if (e.features.length == 1) {
            if (e.features[0].id != null) {
                setHoverState(e.features[0].id, selectedStoryElementId ?? undefined)
                selectedStoryElementId = e.features[0].id
            }
        }
    }

})

const setHoverState = (elementId: number | string, prevElementId?: number | string) => {
    console.log("set ", elementId)
    console.log("unset ", prevElementId)
    if (prevElementId) {
        map.setFeatureState(
            { source: 'exp-story', id: prevElementId },
            { hover: false }
        );
    }

    map.setFeatureState(
        { source: 'exp-story', id: elementId },
        { hover: true }
    );
}

map.on('load', () => {
    console.info('Map load!');
    worker.postMessage(['styleLoaded']);
});

map.on('error', (e: any) => {
    console.error('Map error: ' + e.error);
});
