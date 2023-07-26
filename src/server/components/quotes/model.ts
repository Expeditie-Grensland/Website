import mongoose from "mongoose";

import {
  DateTimeInternal,
  dateTimeSchema,
  dateTimeSchemaDefault,
} from "../dateTime/model.js";
import { DocumentOrId } from "../documents/index.js";
import { QuoteId } from "./id.js";

/**
 * Expeditie quotes.
 */

const schema = new mongoose.Schema({
  quote: String,
  quotee: String,
  dateTime: {
    type: dateTimeSchema,
    default: dateTimeSchemaDefault,
  },
  context: String,
  attachmentFile: String,
});

schema.index({ "dateTime.stamp": 1 });

export interface Quote {
  quote: string;
  quotee: string;
  dateTime: DateTimeInternal;
  context: string;
  attachmentFile?: string;
}

export interface QuoteDocument extends Quote, mongoose.Document {}

export const QuoteModel = mongoose.model<QuoteDocument>(QuoteId, schema);

export type QuoteOrId = DocumentOrId<QuoteDocument>;
