import { GeoLocation, GeoLocationDocument, geoLocationModel } from "./model.js";

export const createMany = (
  locs: GeoLocation[]
): Promise<GeoLocationDocument[]> =>
  geoLocationModel.insertMany(locs, { ordered: false });
