import mongoose, { InferSchemaType, Schema } from "mongoose";

import { dateTimeSchema, dateTimeSchemaDefault } from "../dateTime/model.js";
import { ExpeditieId } from "../expedities/id.js";
import { PersonId } from "../people/id.js";
import { EarnedPointId } from "./id.js";

const earnedPointsSchema = new Schema({
  dateTime: {
    type: dateTimeSchema,
    default: dateTimeSchemaDefault,
  },
  amount: {
    type: Number,
    required: true,
  },
  personId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: PersonId,
    required: true,
  },
  expeditieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ExpeditieId,
  },
});

earnedPointsSchema.index({ "dateTime.stamp": -1 });

export type EarnedPoint = InferSchemaType<typeof earnedPointsSchema>;

export const EarnedPointModel = mongoose.model(
  EarnedPointId,
  earnedPointsSchema
);
