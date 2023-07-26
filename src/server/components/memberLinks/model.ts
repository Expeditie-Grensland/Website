import mongoose, { InferSchemaType, Schema } from "mongoose";

import { MemberLinkId } from "./id.js";

const memberLinksSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: String,
  href: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

memberLinksSchema.index({ index: 1 });

export type MemberLink = InferSchemaType<typeof memberLinksSchema>;

export const memberLinkModel = mongoose.model(MemberLinkId, memberLinksSchema);
