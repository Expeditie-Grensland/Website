import mongoose from 'mongoose';

import { MemberLinkId } from './id.js';
import { DocumentOrId } from '../documents/index.js';

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: String,
    href: {
        type: String,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
})
    .index({ index: 1 });

export interface MemberLink {
    title: string,
    text?: string,
    href: string,
    index: number
}

export interface MemberLinkDocument extends MemberLink, mongoose.Document {
}

export const memberLinkModel = mongoose.model<MemberLinkDocument>(MemberLinkId, schema);

export type MemberLinkOrId = DocumentOrId<MemberLinkDocument>;

