import { Feature, LineString, Point } from "geojson";
import { LngLatBounds, LngLatLike, Map } from "mapbox-gl";
import { Story } from "../expeditie-map";
import { StoryHandler } from "../story/StoryHandler";
import { nodeColors } from "./colors";
import { setRouteBounds, zoomToRoute } from "./view";

export const addRouteLayer = async (map: Map, route: Promise<ArrayBuffer>) => {
  const view = new DataView(await route);

  const features: Feature<LineString>[] = [];
  const bbox: [number, number, number, number] = [
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ];

  const nodeCount = view.getInt32(0);
  let offset = 4;

  for (let nodeNum = 0; nodeNum < nodeCount; nodeNum++) {
    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {
        nodeNum,
        color: nodeColors[nodeNum % nodeColors.length],
      },
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    };

    const locCount = view.getInt32(offset);
    offset += 4;

    for (let i = 0; i < locCount; ++i) {
      const lng = view.getFloat64(offset);
      const lat = view.getFloat64(offset + 8);

      offset += 16;

      feature.geometry.coordinates.push([lng, lat]);

      if (lng < bbox[0]) bbox[0] = lng;
      if (lat < bbox[1]) bbox[1] = lat;
      if (lng > bbox[2]) bbox[2] = lng;
      if (lat > bbox[3]) bbox[3] = lat;
    }

    features.push(feature);
  }

  setRouteBounds(new LngLatBounds(bbox));
  zoomToRoute(map);

  map.addSource("exp-route", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features,
      bbox,
    },
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
  stories: Story[],
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
            coordinates: [story.longitude, story.latitude],
          },
          properties: {
            nodeNum: story.nodeNum,
            color: nodeColors[story.nodeNum % nodeColors.length],
            storyId: story.id,
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
