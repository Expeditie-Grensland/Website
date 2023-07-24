import mongoose from 'mongoose';

import { MediaFileEmbedded, mediaFileEmbeddedSchema } from '../mediaFiles/model.js';
import { QuoteId } from './id.js';
import { DocumentOrId } from '../documents/index.js';
import { DateTimeInternal, dateTimeSchema, dateTimeSchemaDefault } from '../dateTime/model.js';

/**
 * Expeditie quotes.
 */

const schema = new mongoose.Schema(
    {
        quote: String,
        quotee: String,
        dateTime: {
            type: dateTimeSchema,
            default: dateTimeSchemaDefault
        },
        context: String,
        mediaFile: mediaFileEmbeddedSchema
    }
);

schema.index({ 'dateTime.stamp': 1 });

export interface Quote {
    quote: string;
    quotee: string;
    dateTime: DateTimeInternal;
    context: string;
    mediaFile?: MediaFileEmbedded;
}

export interface QuoteDocument extends Quote, mongoose.Document {
}

export const QuoteModel = mongoose.model<QuoteDocument>(QuoteId, schema);

export type QuoteOrId = DocumentOrId<QuoteDocument>;
