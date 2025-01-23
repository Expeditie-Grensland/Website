import { LngLatBounds, Map } from "mapbox-gl";

let routeBounds: LngLatBounds = new LngLatBounds([
  7.048, 53.0545, 7.048, 53.0545,
]);

/**
 * Updates the stored bounds of the route data
 */
export const setRouteBounds = (bounds: LngLatBounds) => {
  routeBounds = bounds;
};

/**
 * Zooms the map to the stored bounds of the route
 */
export const zoomToRoute = (map: Map) => {
  map.fitBounds(routeBounds);
};
