import mongoose, { InferSchemaType, Schema } from "mongoose";

import { dateTimeSchema, dateTimeSchemaDefault } from "../dateTime/model.js";
import { ExpeditieId } from "../expedities/id.js";
import { PersonId } from "../people/id.js";
import { GeoLocationId } from "./id.js";

const geoLocationSchema = new Schema({
  expeditieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ExpeditieId,
    required: true,
  },
  personId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: PersonId,
    required: true,
  },
  dateTime: {
    type: dateTimeSchema,
    default: dateTimeSchemaDefault,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  altitude: Number,
  horizontalAccuracy: Number,
  verticalAccuracy: Number,
  speed: Number,
  speedAccuracy: Number,
  bearing: Number,
  bearingAccuracy: Number,
});

geoLocationSchema.index({
  expeditieId: 1,
  _id: -1,
});

geoLocationSchema.index({
  expeditieId: 1,
  personId: 1,
});

geoLocationSchema.index({
  personId: 1,
  "dateTime.stamp": 1,
});

geoLocationSchema.index({
  "dateTime.stamp": 1,
});

geoLocationSchema.index(
  {
    expeditieId: 1,
    personId: 1,
    "dateTime.stamp": 1,
  },
  { unique: true }
);

export type GeoLocation = InferSchemaType<typeof geoLocationSchema>;

export const geoLocationModel = mongoose.model(
  GeoLocationId,
  geoLocationSchema
);
