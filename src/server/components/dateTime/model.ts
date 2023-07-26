import { InferSchemaType, Schema } from "mongoose";

export const dateTimeSchemaDefault = {
  stamp: 0,
  zone: "Europe/Amsterdam",
};

export const dateTimeSchema = new Schema({
  stamp: {
    type: Number,
    required: true,
    default: 0,
  },
  zone: {
    type: String,
    required: true,
    default: "Europe/Amsterdam",
  },
});

export type DateTimeInternal = InferSchemaType<typeof dateTimeSchema>;
