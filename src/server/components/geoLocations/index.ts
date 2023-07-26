import { GeoLocation, geoLocationModel } from "./model.js";

export const createMany = async (locs: GeoLocation[]) =>
  await geoLocationModel.insertMany(locs, { ordered: false });
