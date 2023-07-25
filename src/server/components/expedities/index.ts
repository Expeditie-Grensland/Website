import mongoose from "mongoose";

import {
  Expeditie,
  ExpeditieDocument,
  ExpeditieModel,
  ExpeditieOrId,
} from "./model.js";
import { PersonDocument } from "../people/model.js";
import { getObjectId } from "../documents/index.js";
import { geoLocationModel } from "../geoLocations/model.js";
import { GeoNodeDocument, geoNodeModel } from "../geoNodes/model.js";

export const getByNameShortPopulated = (
  nameShort: string
): Promise<ExpeditieDocument | null> =>
  ExpeditieModel.findOne({ nameShort })
    .populate("personIds")
    .populate("movieEditorIds")
    .exec();

export const getAll = (): Promise<ExpeditieDocument[]> =>
  ExpeditieModel.find({}).sort({ sequenceNumber: -1 }).exec();

export const getById = (
  id: mongoose.Types.ObjectId
): Promise<ExpeditieDocument | null> => ExpeditieModel.findById(id).exec();

export const getLocationCount = (expeditie: ExpeditieOrId): Promise<number> =>
  geoLocationModel.count({ expeditieId: getObjectId(expeditie) }).exec();

export const getNodes = (
  expeditie: ExpeditieOrId
): Promise<GeoNodeDocument[]> =>
  geoNodeModel
    .find({ expeditieId: getObjectId(expeditie) })
    .sort({ _id: 1 })
    .exec();

export const getNodesWithPeople = (
  expeditie: ExpeditieOrId // FIXME: see geonodes model
) =>
  geoNodeModel
    .find({ expeditieId: getObjectId(expeditie) })
    .sort({ _id: 1 })
    .populate("personIds")
    .exec() as Promise<(GeoNodeDocument & { personIds: PersonDocument[] })[]>;

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
