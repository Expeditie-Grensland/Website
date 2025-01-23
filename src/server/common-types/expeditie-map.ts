export type MapNode = {
  id: number;
  childIds: number[];
  color: string;
  posPart: number;
  posTotal: number;
};

export type MapStory = {
  id: number;
  nodeId: number;
  timeStamp: number;
  lng: number;
  lat: number;
};
