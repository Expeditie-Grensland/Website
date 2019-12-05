import * as mongoose from 'mongoose';

import { ExpeditieId } from '../expedities/id';
import { PersonId } from '../people/id';
import { StoryElementId } from './id';
import { DocumentOrId } from '../documents';

interface BaseStoryElement {
    expeditieId: mongoose.Types.ObjectId,
    personId: mongoose.Types.ObjectId,
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


const storyElementSchema = new mongoose.Schema({
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
    time: {
        type: Number,
        required: true,
        set: (t: number) => t > 1e10 ? t / 1000 : t
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
