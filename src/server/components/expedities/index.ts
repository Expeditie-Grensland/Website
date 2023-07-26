import mongoose, { HydratedDocument } from "mongoose";

import { Expeditie, ExpeditieModel } from "./model.js";
import { geoLocationModel } from "../geoLocations/model.js";
import { geoNodeModel } from "../geoNodes/model.js";
import { Person } from "../people/model.js";

export const getByNameShortPopulated = async (nameShort: string) =>
  await ExpeditieModel.findOne({ nameShort })
    .populate<{ personIds: Person[] }>("personIds")
    .populate<{ movieEditorIds: Person[] }>("movieEditorIds");

export const getAll = async () =>
  await ExpeditieModel.find({}).sort({ sequenceNumber: -1 });

export const getById = async (id: mongoose.Types.ObjectId) =>
  await ExpeditieModel.findById(id);

export const getLocationCount = async (expeditieId: mongoose.Types.ObjectId) =>
  await geoLocationModel.count({ expeditieId });

export const getNodes = async (expeditieId: mongoose.Types.ObjectId) =>
  await geoNodeModel.find({ expeditieId }).sort({ _id: 1 });

export const getNodesWithPeople = async (
  expeditieId: mongoose.Types.ObjectId
) =>
  await geoNodeModel
    .find({ expeditieId })
    .sort({ _id: 1 })
    .populate<{ personIds: HydratedDocument<Person>[] }>("personIds");

export const getMovieUrls = (expeditie: Expeditie) => ({
  fallbackMP4:
    expeditie !== undefined
      ? `/media/${expeditie.nameShort}/progressive.mp4`
      : "",
  manifest:
    expeditie !== undefined ? `/media/${expeditie.nameShort}/index.m3u8` : "",
  poster:
    expeditie !== undefined ? `/media/${expeditie.nameShort}/poster.jpg` : "",
});
