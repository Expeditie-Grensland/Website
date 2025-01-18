import { Map, NavigationControl, ScaleControl } from "mapbox-gl";
import { SatelliteControl, CenterRouteControl } from "./controls";

/**
 * Initialises the base map with built-in styles, layers and controls
 */
export const createBaseMap = () => {
  const map = new Map({
    container: "map",
    projection: "globe",
    style: "mapbox://styles/mapbox/outdoors-v12",
    center: [7.048, 53.0545],
    zoom: 2,
    language: "en",
    antialias: true,
    performanceMetricsCollection: false,
  });

  map.on("error", (error) => console.error("Map error:", error));

  observeMapPadding(map);

  map.addControl(new NavigationControl());
  map.addControl(new ScaleControl());
  map.addControl(new CenterRouteControl());
  map.addControl(new SatelliteControl());

  map.on("load", () => {
    addBuildingsLayer(map);
    addTerrainLayer(map);
    addSatelliteLayer(map);
  });

  return map;
};

/**
 * Updates the padding on the map based on the stories size
 */
const updateMapPadding = (map: Map) => {
  map.setPadding({
    top: 40,
    bottom: 40,
    left:
      window.innerWidth < 1100
        ? 40
        : 24 + (document.getElementById("storyline")?.offsetWidth || 16),
    right: 40,
  });
};

/**
 * Keeps the padding of the map updated based on the stories size
 */
const observeMapPadding = (map: Map) => {
  updateMapPadding(map);

  const storyline = document.getElementById("storyline");
  if (storyline) {
    const observer = new ResizeObserver(() => updateMapPadding(map));
    observer.observe(storyline);
  }
};

/**
 * Adds a 3D buildings layer to the map, appearing smoothly from zoom-level 15
 */
const addBuildingsLayer = (map: Map) => {
  map.addLayer(
    {
      id: "add-3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",

        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "min_height"],
        ],
        "fill-extrusion-opacity": 0.6,
      },
    },
    map
      .getStyle()!
      .layers.find(
        (layer) => layer.type === "symbol" && layer.layout!["text-field"]
      )!.id
  );
};

/**
 * Adds 3D terrain, foggy atmosphere and a hillshading layer to the map
 */
const addTerrainLayer = (map: Map) => {
  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  });

  map.setTerrain({ source: "mapbox-dem", exaggeration: 1.25 });

  map.setFog({
    color: "rgb(186, 210, 235)",
    "horizon-blend": 0.02,
  });

  map.addLayer(
    {
      id: "hillshading",
      source: "mapbox-dem",
      type: "hillshade",
      paint: {
        "hillshade-exaggeration": 0.2,
      },
    },
    "land-structure-polygon"
  );
};

/**
 * Adds a satellite layer to the map, hidden by default
 */
const addSatelliteLayer = (map: Map) => {
  map.addSource("mapbox-satellite", {
    type: "raster",
    url: "mapbox://mapbox.satellite",
    tileSize: 512,
  });

  map.addLayer(
    {
      id: "satellite",
      source: "mapbox-satellite",
      layout: {
        visibility: "none",
      },
      type: "raster",
    },
    "tunnel-street-low"
  );
};
