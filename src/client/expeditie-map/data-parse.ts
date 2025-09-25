import type { Feature, FeatureCollection, LineString } from "geojson";
import { LngLatBounds } from "mapbox-gl";
import type { MapSegment } from "../../server/common-types/expeditie-map";
import { getSegmentCombos, removeUselessSegments } from "./segments";

/**
 * Fetches the binary route location data, then parses it
 */
export const fetchRouteData = async (url: string, segments: MapSegment[]) => {
  const response = await fetch(url);
  if (response.status !== 200) throw new Error("Probleem met ophalen route");

  return parseRouteData(await response.arrayBuffer(), segments);
};

type SegmentProperties = {
  color: string;
  type: "normal" | "flight";
};

type SegmentFeature = Feature<LineString, SegmentProperties> & { id: number };

export type ParsedRouteData = FeatureCollection<
  LineString,
  SegmentProperties
> & {
  bounds: LngLatBounds;
};

/**
 * Converts binary route location data to a GeoJson FeatureCollection of
 * LineStrings
 */
const parseRouteData = (
  data: ArrayBuffer,
  segments: MapSegment[]
): ParsedRouteData => {
  const view = new DataView(data);

  const features: SegmentFeature[] = [];
  const bounds = new LngLatBounds();

  const segmentCount = view.getUint32(0);

  let offset = 8;

  for (let i = 0; i < segmentCount; i++) {
    const segment = segments.find((s) => s.id === view.getUint32(offset));
    if (!segment) throw new Error("Segment niet gevonden");

    const locCount = view.getUint32(offset + 4);
    offset += 8;
    if (locCount === 0) continue;

    const feature: SegmentFeature = {
      type: "Feature",
      id: segment.id,
      properties: {
        color: segment.color,
        type: segment.type,
      },
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    };

    for (let i = 0; i < locCount; ++i) {
      const lng = view.getFloat64(offset);
      const lat = view.getFloat64(offset + 8);

      offset += 16;

      bounds.extend([lng, lat]);
      feature.geometry.coordinates.push([lng, lat]);
    }

    features.push(feature);
  }

  const segmentCombos = getSegmentCombos(
    removeUselessSegments(
      segments,
      features.map((f) => f.id)
    )
  );

  for (const [parent, child] of segmentCombos) {
    const parentCoords = features.find((f) => f.id === parent.id)!.geometry
      .coordinates;
    const childCoords = features.find((f) => f.id === child.id)!.geometry
      .coordinates;

    if (child.type === "flight" || parent.childIds.length > 1) {
      childCoords.unshift(parentCoords[parentCoords.length - 1]);
    } else {
      parentCoords.push(childCoords[0]);
    }
  }

  return {
    type: "FeatureCollection",
    features,
    bounds,
  };
};
