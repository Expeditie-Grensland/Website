import { LngLatBounds, Map } from "mapbox-gl";

let routeBounds: LngLatBounds = new LngLatBounds([
  7.048, 53.0545, 7.048, 53.0545,
]);

export const setRouteBounds = (bounds: LngLatBounds) => {
  routeBounds = bounds;
};

export const zoomToRoute = (map: Map) => {
  map.fitBounds(routeBounds);
};
