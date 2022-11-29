import * as mongoose from 'mongoose';

import { ExpeditieId } from '../expedities/id';
import { PersonId } from '../people/id';
import { BaseStoryElementId, LocationStoryElementId, TextStoryElementId } from './id';
import { DocumentOrId } from '../documents';
import { DateTimeInternal, dateTimeSchema, dateTimeSchemaDefault } from '../dateTime/model';

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

export type StoryElement = TextStoryElement | LocationStoryElement;


export interface TextStoryElementDocument extends TextStoryElement, mongoose.Document {}

export interface LocationStoryElementDocument extends LocationStoryElement, mongoose.Document {}

export type StoryElementDocument = TextStoryElementDocument | LocationStoryElementDocument;


// TODO: look at discriminators (https://mongoosejs.com/docs/discriminators.html) and perhaps introduce them here.

const baseStoryElementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'location'],
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
});

const textStoryElementSchema = new mongoose.Schema({
    title: String,
    text: String
});

const locationStoryElementSchema = new mongoose.Schema({
    name: String
});

export const BaseStoryElementModel = mongoose.model<StoryElementDocument>(BaseStoryElementId, baseStoryElementSchema);
export const TextStoryElementModel = BaseStoryElementModel.discriminator<TextStoryElementDocument>(TextStoryElementId, textStoryElementSchema);
export const LocationStoryElementModel = BaseStoryElementModel.discriminator<LocationStoryElementDocument>(LocationStoryElementId, locationStoryElementSchema);

export type StoryElementOrId = DocumentOrId<StoryElementDocument>;
