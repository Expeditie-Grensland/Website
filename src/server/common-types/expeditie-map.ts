export type MapNode = {
  id: number;
  childIds: number[];
  nodeNum: number;
};

export type MapStory = {
  id: number;
  nodeId: number;
  nodeNum: number;
  timeStamp: number;
  lng: number;
  lat: number;
};
