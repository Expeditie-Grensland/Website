import { Feature, LineString, Point } from "geojson";
import { LngLatBounds, LngLatLike, Map } from "mapbox-gl";
import { MapSegment, MapStory } from "../../server/common-types/expeditie-map";
import { setRouteBounds, zoomToRoute } from "./view";
import {
  resetStoryGraphHover,
  scrollToStory,
  setStoryGraphHover,
} from "./story-graph";

/**
 * Converts route location data to GeoJSON and adds it as a source to the map,
 * then adds a styling layer for the data
 */
export const addRouteLayer = async (
  map: Map,
  segments: MapSegment[],
  route: ArrayBuffer
) => {
  const view = new DataView(route);

  const features: Feature<LineString>[] = [];
  const bounds = new LngLatBounds();

  const segmentCount = view.getUint32(0);

  let offset = 8;

  for (let i = 0; i < segmentCount; i++) {
    const segmentId = view.getUint32(offset);

    const feature: Feature<LineString> = {
      type: "Feature",
      properties: {
        segmentId,
        color: segments.find((s) => s.id == segmentId)?.color || "#000",
        type: segments.find((s) => s.id == segmentId)?.type || "normal",
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
    promoteId: "segmentId",
  });

  map.addLayer({
    id: "exp-route",
    type: "line",
    source: "exp-route",
    paint: {
      "line-width": 3,
      "line-color": ["get", "color"],
      "line-opacity": ["case", ["==", ["get", "type"], "flight"], 0.75, 1],
      "line-dasharray": [
        "case",
        ["==", ["get", "type"], "flight"],
        [2, 1],
        [1],
      ],
    },
  });
};

/**
 * Sets the hover state for a story point on the map
 */
export const setStoryPointHover = (map: Map, id: number) => {
  map.setFeatureState({ source: "story-points", id }, { hover: true });
};

/**
 * Resets the hover state for all story points on the map
 */
export const resetStoryPointHover = (map: Map) => {
  map.removeFeatureState({ source: "story-points" });
};

/**
 * Converts the stories to GeoJSON points and adds them as a source to the map,
 * then adds styling layers and interaction handlers
 */
export const addStoryLayer = (
  map: Map,
  segments: MapSegment[],
  stories: MapStory[]
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
            segmentId: story.segmentId,
            color:
              segments.find((n) => n.id == story.segmentId)?.color || "#000",
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

  map.on("click", "story-points", (e) => {
    const feature = e.features![0] as Feature<Point>;

    scrollToStory(feature.id as number);

    map.flyTo({
      center: feature.geometry.coordinates as LngLatLike,
      zoom: 13,
    });
  });

  map.on("mouseenter", "story-points", (event) => {
    map.getCanvas().style.cursor = "pointer";

    const id = event.features![0]!.id as number;

    setStoryPointHover(map, id);
    setStoryGraphHover(id);
  });

  map.on("mouseleave", "story-points", () => {
    map.getCanvas().style.cursor = "";

    resetStoryPointHover(map);
    resetStoryGraphHover();
  });
};
