import { DateTime } from 'luxon';
import * as mongoose from 'mongoose';


export interface DateTimeInternal {
    stamp: number;
    zone: string;
    object: DateTime;
}


export const dateTimeSchema = new mongoose.Schema({
    stamp: {
        type: Number,
        required: true,
        default: 0
    },
    zone: {
        type: String,
        required: true,
        default: 'Europe/Amsterdam'
    }
}, { _id: false });


export const dateTimeSchemaDefault = {
    stamp: 0,
    zone: 'Europe/Amsterdam'
};

dateTimeSchema.virtual('object')
    .get(function (this: DateTimeInternal) {
        return DateTime.fromSeconds(this.stamp, { zone: this.zone, locale: 'nl-NL' });
    })
    .set(function (this: DateTimeInternal, value: DateTime) {
        this.stamp = value.toSeconds();
        this.zone = value.zoneName;
    });
