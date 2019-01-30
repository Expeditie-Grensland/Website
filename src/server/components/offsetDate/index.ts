import { OffsetDate } from './model';

export namespace OffsetDates {
    export const getOffsetDate = (date: Date, offset?: number) => {
        return {
            date,
            offset: offset === undefined ? date.getTimezoneOffset() : offset
        } as OffsetDate;
    };

    // Display the resulting date using .getUTC functions
    export const getDateObject = (offsetDate: OffsetDate) =>
        new Date(offsetDate.date.getTime() - offsetDate.offset * 60000);

    export const getDateDDMM = (offsetDate: OffsetDate): string => {
        const
            d = getDateObject(offsetDate),
            pad = (n: number) => ('0' + n).slice(-2),
            date = pad(d.getUTCDate()),
            month = pad(d.getUTCMonth() + 1);

        return `${date}-${month}`;
    };
}
