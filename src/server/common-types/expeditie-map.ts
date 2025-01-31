export type MapSegment = {
  id: number;
  childIds: number[];
  type: "normal" | "flight";
  color: string;
  posPart: number;
  posTotal: number;
};

export type MapStory = {
  id: number;
  segmentId: number;
  timeStamp: number;
  lng: number;
  lat: number;
};
