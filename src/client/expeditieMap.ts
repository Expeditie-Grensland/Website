import 'core-js/features/promise';
import mapboxgl from 'mapbox-gl';
import {StoryHandler} from './story/StoryHandler';
import {MapHandler} from "./map/MapHandler"

declare const expeditieNameShort: string, mbToken: string;

const worker: Worker = new Worker((document.getElementById('worker') as HTMLLinkElement).href);
worker.postMessage(['retrieveAll', expeditieNameShort]);

mapboxgl.accessToken = mbToken;

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

const mapHandler = new MapHandler(nodeColors);
const storyHandler = new StoryHandler(nodeColors, mapHandler);

mapHandler.setStoryHandler(storyHandler);

worker.onmessage = (event) => {
    switch (event.data[0]) {
        case 'geoJson':
            mapHandler.addExpeditieRoute(event.data[1]);
            console.log("Expeditie route added!")
            break;
        case 'story':
            if (!document.getElementById("story-wrapper")) {
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

