import mapboxgl from "mapbox-gl";
import { MapSegment, MapStory } from "../server/common-types/expeditie-map";
import { createBaseMap } from "./expeditie-map/base-map";
import { addRouteLayer, addStoryLayer } from "./expeditie-map/data-layers";
import { createStoryGraph } from "./expeditie-map/story-graph";

declare const routeLink: string,
  mbToken: string,
  segments: MapSegment[],
  stories: MapStory[];

const routeData = fetch(routeLink).then((response) => {
  if (response.status != 200) throw new Error("Probleem met ophalen route");
  return response.arrayBuffer();
});

mapboxgl.accessToken = mbToken;

const map = createBaseMap();
createStoryGraph(segments, stories, map);

map.on("style.load", async () => {
  await addRouteLayer(map, segments, await routeData);
  addStoryLayer(map, segments, stories);
});
