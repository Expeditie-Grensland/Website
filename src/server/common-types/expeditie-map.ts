export type MapNode = {
  id: number;
  childIds: number[];
  color: string;
};

export type MapStory = {
  id: number;
  nodeId: number;
  timeStamp: number;
  lng: number;
  lat: number;
};
