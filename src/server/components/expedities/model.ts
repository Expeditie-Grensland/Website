import { InferSchemaType, Schema, model } from "mongoose";

import { PersonId } from "../people/id.js";
import { ExpeditieId } from "./id.js";

const expeditieSchema = new Schema({
  sequenceNumber: { type: Number, required: true },
  name: { type: String, required: true },
  nameShort: { type: String, required: true },
  subtitle: { type: String, required: true },
  showMap: { type: Boolean, default: false },
  finished: { type: Boolean, default: false },
  personIds: [
    {
      type: Schema.Types.ObjectId,
      ref: PersonId,
    },
  ],
  countries: [String],
  backgroundFile: { type: String, required: true },
  movieHlsDir: { type: String },
  movieRestricted: { type: Boolean, default: false },
  movieEditorIds: [
    {
      type: Schema.Types.ObjectId,
      ref: PersonId,
    },
  ],
});

expeditieSchema.index({ nameShort: 1 });
expeditieSchema.index({ sequenceNumber: -1 });

export type Expeditie = InferSchemaType<typeof expeditieSchema>;

export const ExpeditieModel = model(ExpeditieId, expeditieSchema);
