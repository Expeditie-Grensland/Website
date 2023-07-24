import mongoose from 'mongoose';

import { ExpeditieId } from '../expedities/id.js';
import { PersonId } from '../people/id.js';
import {BaseStoryElementId, LocationStoryElementId, MediaStoryElementId, TextStoryElementId} from './id.js';
import { DocumentOrId } from '../documents/index.js';
import { DateTimeInternal, dateTimeSchema, dateTimeSchemaDefault } from '../dateTime/model.js';
import {MediaFileEmbedded, mediaFileEmbeddedSchema} from "../mediaFiles/model.js"

interface BaseStoryElement {
    expeditieId: mongoose.Types.ObjectId,
    personId: mongoose.Types.ObjectId,
    dateTime: DateTimeInternal,
    index?: number
}

export interface TextStoryElement extends BaseStoryElement {
    type: 'text',
    title: string,
    text: string
}

export interface LocationStoryElement extends BaseStoryElement {
    type: 'location',
    name: string
}

export type StoryMedia = {
    description: string,
    mediaFile: MediaFileEmbedded
}

export interface MediaStoryElement extends BaseStoryElement {
    type: 'media',
    title: string,
    media: StoryMedia[]
}

export type StoryElement = TextStoryElement | LocationStoryElement | MediaStoryElement;


export interface TextStoryElementDocument extends TextStoryElement, mongoose.Document {}

export interface LocationStoryElementDocument extends LocationStoryElement, mongoose.Document {}
export interface MediaStoryElementDocument extends MediaStoryElement, mongoose.Document {}

export type StoryElementDocument = TextStoryElementDocument | LocationStoryElementDocument | MediaStoryElementDocument;


// This uses discriminators (https://mongoosejs.com/docs/discriminators.html) to distinguish between the different types of story elements
const options = { discriminatorKey: 'type' };

const baseStoryElementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'location', 'media'],
        required: true
    },
    expeditieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ExpeditieId,
        required: true
    },
    personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PersonId,
        required: true
    },
    dateTime: {
        type: dateTimeSchema,
        default: dateTimeSchemaDefault
    },
    index: {
        type: Number,
        default: 0
    }
}, options);

const textStoryElementSchema = new mongoose.Schema({
    title: String,
    text: String
}, options);

const locationStoryElementSchema = new mongoose.Schema({
    name: String
}, options);

const mediaStoryElementSchema = new mongoose.Schema({
    title: String,
    media: [{
        description: String,
        mediaFile: mediaFileEmbeddedSchema
    }]
}, options);

export const BaseStoryElementModel = mongoose.model<StoryElementDocument>(BaseStoryElementId, baseStoryElementSchema);
export const TextStoryElementModel = BaseStoryElementModel.discriminator<TextStoryElementDocument>(TextStoryElementId, textStoryElementSchema, 'text');
export const LocationStoryElementModel = BaseStoryElementModel.discriminator<LocationStoryElementDocument>(LocationStoryElementId, locationStoryElementSchema, 'location');
export const MediaStoryElementModel = BaseStoryElementModel.discriminator<MediaStoryElementDocument>(MediaStoryElementId, mediaStoryElementSchema, 'media')

export type StoryElementOrId = DocumentOrId<StoryElementDocument>;
