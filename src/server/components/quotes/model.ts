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
        context: String,
        mediaFile: mediaFileEmbeddedSchema
    }
);

schema.index({ quote: 1 }, { collation: { locale: 'nl', strength: 1 } });

export interface Quote {
    quote: string;
    quotee: string;
    context: string;
    mediaFile?: MediaFileEmbedded;
}

export interface QuoteDocument extends Quote, mongoose.Document {}

export const QuoteModel = mongoose.model<QuoteDocument>(QuoteId, schema);

export type QuoteOrID = DocumentOrID<QuoteDocument>;

