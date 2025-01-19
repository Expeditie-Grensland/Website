import { Feature, LineString, Point } from "geojson";
import { LngLatBounds, LngLatLike, Map } from "mapbox-gl";
import { MapNode, MapStory } from "../../server/common-types/expeditie-map";
import { StoryHandler } from "../story/StoryHandler";
import { setRouteBounds, zoomToRoute } from "./view";

export const addRouteLayer = async (
  map: Map,
  nodes: MapNode[],
  route: Promise<ArrayBuffer>
) => {
  const view = new DataView(await route);

  const features: Feature<LineString>[] = [];
  const bounds = new LngLatBounds();

  const nodeCount = view.getUint32(0);

  let offset = 8;

  for (let i = 0; i < nodeCount; i++) {
    const nodeId = view.getUint32(offset);

    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {
        nodeId,
        color: nodes.find((n) => n.id == nodeId)?.color || "#000",
      },
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    };

    const locCount = view.getUint32(offset + 4);
    offset += 8;

    for (let i = 0; i < locCount; ++i) {
      const lng = view.getFloat64(offset);
      const lat = view.getFloat64(offset + 8);

      offset += 16;

      bounds.extend([lng, lat]);
      feature.geometry.coordinates.push([lng, lat]);
    }

    features.push(feature);
  }

  setRouteBounds(bounds);
  zoomToRoute(map);

  map.addSource("exp-route", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features,
    },
    promoteId: "nodeId",
  });

  map.addLayer({
    id: "exp-route",
    type: "line",
    source: "exp-route",
    paint: {
      "line-opacity": 1,
      "line-width": 3,
      "line-color": ["get", "color"],
    },
  });
};

export const setStoryPointHover = (map: Map, id: number) => {
  map.setFeatureState({ source: "story-points", id }, { hover: true });
};

export const resetStoryPointHover = (map: Map) => {
  map.removeFeatureState({ source: "story-points" });
};

export const addStoryLayer = (
  map: Map,
  nodes: MapNode[],
  stories: MapStory[],
  storyHandler: StoryHandler
) => {
  map.addSource("story-points", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: stories.map((story) => {
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [story.lng, story.lat],
          },
          properties: {
            storyId: story.id,
            nodeId: story.nodeId,
            color: nodes.find((n) => n.id == story.nodeId)?.color || "#000",
          },
        };
      }),
    },
    promoteId: "storyId",
    // TODO: re-implement clusters
  });

  map.addLayer({
    id: "story-points",
    type: "circle",
    source: "story-points",
    filter: ["!", ["has", "point_count"]], // only render unclustered points with this layer.
    paint: {
      "circle-radius": [
        "interpolate",
        ["exponential", 1],
        ["zoom"],
        3,
        ["case", ["boolean", ["feature-state", "hover"], false], 6, 4],
        20,
        ["case", ["boolean", ["feature-state", "hover"], false], 12, 8],
      ],
      "circle-stroke-width": [
        "interpolate",
        ["exponential", 1],
        ["zoom"],
        3,
        ["case", ["boolean", ["feature-state", "hover"], false], 4, 3],
        20,
        ["case", ["boolean", ["feature-state", "hover"], false], 7, 5],
      ],
      "circle-pitch-alignment": "map",
      "circle-color": "#fff",
      "circle-stroke-color": ["get", "color"],
    },
  });

  // Center the map on the coordinates of any clicked circle from the 'circle' layer.
  map.on("click", "story-points", (e) => {
    const feature = e.features![0] as Feature<Point>;

    map.flyTo({
      center: feature.geometry.coordinates as LngLatLike,
      zoom: 13,
    });

    storyHandler?.scrollToStory(feature.id as string);
  });

  // Change the cursor to a pointer when it enters a feature in the 'circle' layer.
  map.on("mouseenter", "story-points", (event) => {
    map.getCanvas().style.cursor = "pointer";

    const id = event.features![0]?.id as number;
    if (!id) return;

    setStoryPointHover(map, id);
    storyHandler?.setHoveringStory(id);
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "story-points", () => {
    map.getCanvas().style.cursor = "";

    resetStoryPointHover(map);
    storyHandler?.resetHoveringStory();
  });
};
