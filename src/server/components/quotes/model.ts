import * as mongoose from 'mongoose';

import { MediaFileEmbedded, mediaFileEmbeddedSchema } from '../mediaFiles/model';
import { QuoteId } from './id';
import { DocumentOrId } from '../documents';
import { DateTimeInternal, dateTimeSchema } from '../dateTime/model';

/**
 * Expeditie quotes.
 */

const schema = new mongoose.Schema(
    {
        quote: String,
        quotee: String,
        dateTime: {
            type: dateTimeSchema,
            default: dateTimeSchema
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
