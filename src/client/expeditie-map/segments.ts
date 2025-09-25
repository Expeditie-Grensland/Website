import type { MapSegment } from "../../server/common-types/expeditie-map";

/**
 * Removes unused segments from an array based on a list of used segment ids,
 * while making sure the parent-child relations are kept correctly
 */
export const removeUselessSegments = (
  segments: MapSegment[],
  usefulSegmentIds: number[]
) => {
  const uselessIds = segments
    .map((s) => s.id)
    .filter((id) => !usefulSegmentIds.includes(id));

  return uselessIds.reduce((usefulSegments, ulId) => {
    const ulChildIds =
      usefulSegments.find((s) => s.id === ulId)?.childIds || [];

    return usefulSegments
      .filter((s) => s.id !== ulId)
      .map((s) =>
        s.childIds.includes(ulId)
          ? {
              ...s,
              childIds: s.childIds.flatMap((id) =>
                id === ulId ? ulChildIds : id
              ),
            }
          : s
      );
  }, segments);
};

/**
 * Returns a list of parent-child segment combinations
 */
export const getSegmentCombos = (segments: MapSegment[]) => {
  const combos: [MapSegment, MapSegment][] = [];

  for (const parent of segments) {
    for (const childId of parent.childIds) {
      const child = segments.find((s) => s.id === childId);
      if (!child) throw new Error("Kind niet gevonden");

      combos.push([parent, child]);
    }
  }

  return combos;
};
