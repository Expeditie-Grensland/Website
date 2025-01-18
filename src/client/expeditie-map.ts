import mapboxgl from "mapbox-gl";
import { addRouteLayer, addStoryLayer } from "./expeditie-map/data-layers";
import { StoryHandler } from "./story/StoryHandler";
import { createBaseMap } from "./expeditie-map/base-map";

export type GeoNode = {
  id: number; // TODO: should not be necessary
  nodeNum: number;
  timeFrom: number;
  timeTill: number;
  persons: string[];
};

export type Story = {
  id: number; // TODO: should not be necessary
  nodeNum: number;
  timeStamp: number;
  latitude: number;
  longitude: number;
};

export type NodesAndStories = {
  nodes: GeoNode[];
  stories: Story[];
};

declare const routeLink: string,
  mbToken: string,
  nodesAndStories: NodesAndStories;

const routeData = fetch(routeLink).then((response) => {
  if (response.status != 200) throw new Error("Probleem met ophalen route");
  return response.arrayBuffer();
});

mapboxgl.accessToken = mbToken;

const map = createBaseMap();
const storyHandler = new StoryHandler(map);

map.on("load", async () => {
  storyHandler.renderStory(nodesAndStories);

  await addRouteLayer(map, routeData);
  addStoryLayer(map, nodesAndStories.stories, storyHandler);
});
