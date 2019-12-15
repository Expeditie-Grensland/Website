import { DateTime } from 'luxon';

import { EarnedPointModel } from '../components/earnedPoints/model';
import { geoLocationModel } from '../components/geoLocations/model';
import { EarnedPoints } from '../components/earnedPoints';
import { Quotes } from '../components/quotes';
import { QuoteModel } from '../components/quotes/model';

export default async () => {
    await EarnedPointModel.collection.dropIndexes();
    await Promise.all((await EarnedPoints.getAll()).map(ep => {
        const dt = DateTime.fromJSDate(ep.toObject().date.date, {zone: getZone(ep.toObject().date.offset)});

        return EarnedPointModel.findByIdAndUpdate(ep._id, {
            $set: { dateTime: { stamp: dt.toSeconds(), zone: dt.zoneName } },
            $unset: { date: true }
        }, { strict: false }).exec();
    }));
    await EarnedPointModel.syncIndexes();


    await QuoteModel.collection.dropIndexes();
    await Promise.all((await Quotes.getAll()).map(q => {
        return QuoteModel.findByIdAndUpdate(q._id, {
            $set: { dateTime: { stamp: q.toObject().time, zone: 'Europe/Amsterdam' } },
            $unset: { time: true }
        }, { strict: false }).exec();
    }));
    await QuoteModel.syncIndexes();

    await geoLocationModel.collection.dropIndexes();
    for (let i = 0; ; i++) {
        const locs = await geoLocationModel.find({}).sort({ _id: 1 }).skip(i * 1000).limit(1000).exec();
        if (locs.length == 0) break;

        await Promise.all(locs.map(loc =>
            geoLocationModel.findByIdAndUpdate(loc._id, {
                $set: { dateTime: { stamp: loc.toObject().time, zone: loc.toObject().timezone } },
                $unset: { time: true, zone: true }
            }, { strict: false })
        ));
    }
    await geoLocationModel.syncIndexes();
}

const getZone = (offset: number): any => {
    offset = -offset;

    switch (offset) {
        case 540:
            return 'Asia/Tokyo';
        case 360:
            return 'Asia/Almaty';
        case 120:
            return 'Europe/Amsterdam';
        default:
            return offset;
    }
};
