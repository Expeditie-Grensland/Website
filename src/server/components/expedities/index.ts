import mongoose from "mongoose";

import { Expeditie, ExpeditieModel } from "./model.js";
import { PersonDocument } from "../people/model.js";
import { geoLocationModel } from "../geoLocations/model.js";
import { geoNodeModel } from "../geoNodes/model.js";

export const getByNameShortPopulated = (nameShort: string) =>
  ExpeditieModel.findOne({ nameShort })
    .populate<{ personIds: PersonDocument[] }>("personIds")
    .populate<{ movieEditorIds: PersonDocument[] }>("movieEditorIds")
    .exec();

export const getAll = () =>
  ExpeditieModel.find({}).sort({ sequenceNumber: -1 }).exec();

export const getById = (id: mongoose.Types.ObjectId) =>
  ExpeditieModel.findById(id).exec();

export const getLocationCount = (expeditieId: mongoose.Types.ObjectId) =>
  geoLocationModel.count({ expeditieId }).exec();

export const getNodes = (expeditieId: mongoose.Types.ObjectId) =>
  geoNodeModel.find({ expeditieId }).sort({ _id: 1 }).exec();

export const getNodesWithPeople = (expeditieId: mongoose.Types.ObjectId) =>
  geoNodeModel
    .find({ expeditieId })
    .sort({ _id: 1 })
    .populate<{ personIds: PersonDocument[] }>("personIds")
    .exec();

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
