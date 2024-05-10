import { InferSchemaType, Schema, model } from "mongoose";

import { AfkoId } from "./id.js";

const afkoSchema = new Schema({
  afko: { type: String, required: true },
  definitions: [String],
  attachmentFile: String,
});

afkoSchema.index({ afko: 1 }, { collation: { locale: "nl", strength: 1 } });

export type Afko = InferSchemaType<typeof afkoSchema>;

export const AfkoModel = model(AfkoId, afkoSchema);
