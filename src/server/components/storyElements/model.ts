import * as mongoose from 'mongoose';

import { ExpeditieId } from '../expedities/id';
import { PersonId } from '../people/id';
import { StoryElementId } from './id';
import { DocumentOrId } from '../documents';
import { DateTimeInternal, dateTimeSchema } from '../dateTime/model';

interface BaseStoryElement {
    expeditieId: mongoose.Types.ObjectId,
    personId: mongoose.Types.ObjectId,
    dateTime: DateTimeInternal,
    time: number,
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

export interface TextStoryElementDocument extends TextStoryElement, mongoose.Document {
}

export interface LocationStoryElementDocument extends LocationStoryElement, mongoose.Document {
}

export type StoryElementDocument = TextStoryElementDocument | LocationStoryElementDocument;


// TODO: look at discriminators (https://mongoosejs.com/docs/discriminators.html) and perhaps introduce them here.

const storyElementSchema = new mongoose.Schema({
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
        default: dateTimeSchema
    },
    index: {
        type: Number,
        default: 0
    },
    title: String,
    text: String,
    name: String
});

export const storyElementModel = mongoose.model<StoryElementDocument>(StoryElementId, storyElementSchema);

export type StoryElementOrId = DocumentOrId<StoryElementDocument>;
