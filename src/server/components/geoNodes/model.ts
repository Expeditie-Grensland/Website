import mongoose, { InferSchemaType, Schema } from "mongoose";

import { ExpeditieId } from "../expedities/id.js";
import { PersonId } from "../people/id.js";
import { GeoNodeId } from "./id.js";

const geoNodeSchema = new Schema({
  expeditieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ExpeditieId,
    required: true,
  },
  personIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: PersonId,
      required: true,
    },
  ],
  timeFrom: {
    type: Number,
    default: 0,
    set: (t: number) => (t > 1e10 ? t / 1000 : t),
  },
  timeTill: {
    type: Number,
    default: Number.POSITIVE_INFINITY,
    set: (t: number) => (t > 1e10 ? t / 1000 : t),
  },
});

geoNodeSchema.index({
  expeditieId: 1,
  timeTill: 1,
});

export type GeoNode = InferSchemaType<typeof geoNodeSchema>;

export const geoNodeModel = mongoose.model(GeoNodeId, geoNodeSchema);
