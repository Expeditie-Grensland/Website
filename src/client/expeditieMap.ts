import 'core-js/features/promise';
import mapboxgl from 'mapbox-gl';
import {StoryHandler} from './story/StoryHandler';
import {MapHandler} from "./map/MapHandler"

declare var expeditieNameShort: string;
declare var hasStory: boolean;

const worker: Worker = new Worker((document.getElementById('worker') as HTMLLinkElement).href);
worker.postMessage(['retrieveAll', expeditieNameShort]);

mapboxgl.accessToken =
    'pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw';

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

const mapHandler = new MapHandler(hasStory, nodeColors);
const storyHandler = new StoryHandler(hasStory, nodeColors, mapHandler);

mapHandler.setStoryHandler(storyHandler);

// @ts-ignore
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

