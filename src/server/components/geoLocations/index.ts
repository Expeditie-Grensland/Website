import mongoose from "mongoose";
import { GeoLocation, geoLocationModel } from "./model.js";

export const createManyLocations = async (locs: GeoLocation[]) =>
  await geoLocationModel.insertMany(locs, { ordered: false });

export const getLocationCountByExpeditie = async (
  expeditieId: mongoose.Types.ObjectId
) => await geoLocationModel.count({ expeditieId });
