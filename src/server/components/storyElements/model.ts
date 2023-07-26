import mongoose, { InferSchemaType, Schema } from "mongoose";

import { ExpeditieId } from "../expedities/id.js";
import { PersonId } from "../people/id.js";
import {
  BaseStoryElementId,
  LocationStoryElementId,
  MediaStoryElementId,
  TextStoryElementId,
} from "./id.js";
import { dateTimeSchema, dateTimeSchemaDefault } from "../dateTime/model.js";

const options = { discriminatorKey: "type" };

const baseStoryElementSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "location", "media"],
      required: true,
    },
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
    index: {
      type: Number,
      default: 0,
    },
  },
  { discriminatorKey: "type" }
);

export type BaseStoryElement = InferSchemaType<typeof baseStoryElementSchema>;

const textStoryElementSchema = new Schema(
  {
    title: { type: String, required: true },
    text: String,
  },
  options
);

export type TextStoryElement = BaseStoryElement &
  InferSchemaType<typeof textStoryElementSchema>;

const locationStoryElementSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  options
);

export type LocationStoryElement = BaseStoryElement &
  InferSchemaType<typeof locationStoryElementSchema>;

const mediaStoryElementSchema = new Schema(
  {
    title: String,
    media: [
      {
        file: { type: String, required: true },
        description: String,
      },
    ],
  },
  options
);

export type MediaStoryElement = BaseStoryElement &
  InferSchemaType<typeof mediaStoryElementSchema>;

export type StoryElement =
  | TextStoryElement
  | LocationStoryElement
  | MediaStoryElement;

export const BaseStoryElementModel = mongoose.model(
  BaseStoryElementId,
  baseStoryElementSchema
);

export const TextStoryElementModel =
  BaseStoryElementModel.discriminator<TextStoryElement>(
    TextStoryElementId,
    textStoryElementSchema,
    "text"
  );

export const LocationStoryElementModel =
  BaseStoryElementModel.discriminator<LocationStoryElement>(
    LocationStoryElementId,
    locationStoryElementSchema,
    "location"
  );

export const MediaStoryElementModel =
  BaseStoryElementModel.discriminator<MediaStoryElement>(
    MediaStoryElementId,
    mediaStoryElementSchema,
    "media"
  );
