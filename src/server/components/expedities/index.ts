import mongoose from "mongoose";

import { getFileUrl } from "../../helpers/files.js";
import { Person } from "../people/model.js";
import { Expeditie, ExpeditieModel } from "./model.js";

export const getPopulatedExpeditieByName = async (nameShort: string) =>
  await ExpeditieModel.findOne({ nameShort })
    .populate<{ personIds: Person[] }>("personIds")
    .populate<{ movieEditorIds: Person[] }>("movieEditorIds");

export const getAllExpedities = async () =>
  await ExpeditieModel.find({}).sort({ sequenceNumber: -1 });

export const getExpeditieById = async (id: mongoose.Types.ObjectId) =>
  await ExpeditieModel.findById(id);

export const getMovieUrlsFromExpeditie = (expeditie: Expeditie) => ({
  fallbackMP4:
    expeditie !== undefined
      ? getFileUrl(`${expeditie.nameShort}/progressive.mp4`)
      : "",
  manifest:
    expeditie !== undefined
      ? getFileUrl(`${expeditie.nameShort}/index.m3u8`)
      : "",
  poster:
    expeditie !== undefined
      ? getFileUrl(`${expeditie.nameShort}/poster.jpg`)
      : "",
});
