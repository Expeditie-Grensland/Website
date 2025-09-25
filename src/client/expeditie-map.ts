import mapboxgl from "mapbox-gl";
import type {
  MapSegment,
  MapStory,
} from "../server/common-types/expeditie-map";
import { createBaseMap } from "./expeditie-map/base-map";
import { addRouteLayer, addStoryLayer } from "./expeditie-map/data-layers";
import { fetchRouteData } from "./expeditie-map/data-parse";
import { createStoryGraph } from "./expeditie-map/story-graph";

declare const routeLink: string,
  mbToken: string,
  segments: MapSegment[],
  stories: MapStory[];

const routeData = fetchRouteData(routeLink, segments);

mapboxgl.accessToken = mbToken;

const map = createBaseMap();
createStoryGraph(segments, stories, map);

map.on("style.load", async () => {
  await addRouteLayer(map, await routeData);
  addStoryLayer(map, segments, stories);
});
