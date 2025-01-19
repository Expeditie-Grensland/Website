import mapboxgl from "mapbox-gl";
import { addRouteLayer, addStoryLayer } from "./expeditie-map/data-layers";
import { StoryHandler } from "./story/StoryHandler";
import { createBaseMap } from "./expeditie-map/base-map";
import { MapNode, MapStory } from "../server/common-types/expeditie-map";

declare const routeLink: string,
  mbToken: string,
  nodes: MapNode[],
  stories: MapStory[];

const routeData = fetch(routeLink).then((response) => {
  if (response.status != 200) throw new Error("Probleem met ophalen route");
  return response.arrayBuffer();
});

mapboxgl.accessToken = mbToken;

const map = createBaseMap();
const storyHandler = new StoryHandler(map);

map.on("load", async () => {
  storyHandler.renderStory(nodes, stories);

  await addRouteLayer(map, routeData);
  addStoryLayer(map, stories, storyHandler);
});
