import { geoLocationModel } from '../components/geoLocations/model';
import * as mongoose from 'mongoose';
import * as R from 'ramda';

export default async () => {
    const aggrResult = await geoLocationModel.aggregate([
        {
            $group: {
                _id: {
                    expeditieId: '$expeditieId',
                    personId: '$personId',
                    time: '$time'
                },
                uniqueIds: { $addToSet: '$_id' },
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { '$gt': 1 }
            }
        }
    ]).exec();

    const duplicateIds = R.flatten(aggrResult.map((x: any) => x.uniqueIds.slice(1))) as [mongoose.Types.ObjectId];

    await geoLocationModel.deleteMany({
        _id: { '$in': duplicateIds }
    }).exec();
}
