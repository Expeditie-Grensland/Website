import * as mongoose from 'mongoose';
import { DocumentOrID } from '../documents/util';
import { MediaFileEmbedded, mediaFileEmbeddedSchema } from '../mediaFiles/model';
import { QuoteId } from './id';

/**
 * Expeditie quotes.
 */

const schema = new mongoose.Schema(
    {
        quote: String,
        quotee: String,
        time: {
            type: Number,
            required: true,
            set: (t: number) => t > 1e10 ? t / 1000 : t
        },
        context: String,
        mediaFile: mediaFileEmbeddedSchema
    }
);

schema.index({ time: 1 });

export interface Quote {
    quote: string;
    quotee: string;
    time: number;
    context: string;
    mediaFile?: MediaFileEmbedded;
}

export interface QuoteDocument extends Quote, mongoose.Document {}

export const QuoteModel = mongoose.model<QuoteDocument>(QuoteId, schema);

export type QuoteOrID = DocumentOrID<QuoteDocument>;

