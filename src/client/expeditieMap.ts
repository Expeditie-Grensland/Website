import 'core-js/features/promise';
import mapboxgl from 'mapbox-gl';
import {StoryHandler} from './story/StoryHandler';
import {MapHandler} from "./map/MapHandler"

declare const expeditieNameShort: string;
declare let hasStory: boolean;

const worker: Worker = new Worker((document.getElementById('worker') as HTMLLinkElement).href);
worker.postMessage(['retrieveAll', expeditieNameShort]);

mapboxgl.accessToken =
    'pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY20zY3VjemN0MHBhdTJtczYyY2FxM2gzbCJ9.W72Jy31JQEFo5YRgcmaMng';

// Crude way to disable stories features for small screen
if (window.screen.availWidth < 1024 || window.screen.availHeight < 768) {
    hasStory = false;
}

const nodeColors = [
    '#2962ff',
    '#d50000',
    '#008c3a',
    '#ff6d00',
    '#c51162',
    '#aa00ff',
    '#aeea00',
    '#00bfa5',
    '#00b8d4',
]

const mapHandler = new MapHandler(hasStory, nodeColors);
const storyHandler = new StoryHandler(hasStory, nodeColors, mapHandler);

mapHandler.setStoryHandler(storyHandler);

worker.onmessage = (event) => {
    switch (event.data[0]) {
        case 'geoJson':
            mapHandler.addExpeditieRoute(event.data[1]);
            console.log("Expeditie route added!")
            break;
        case 'story':
            if (!hasStory) {
                console.log("No story to display")
                return
            }

            mapHandler.addStoryLayer(event.data[1]);
            storyHandler.renderStory(event.data[1]);
    }
};

mapHandler.map.on('load', () => {
    console.info('Map load!');
    worker.postMessage(['styleLoaded']);
});

