import * as mongoose from 'mongoose';

import { ExpeditieModel } from '../components/expedities/model';

export default async () => {
    let expedities = ExpeditieModel.collection.find();

    await expedities.forEach(async (x) => {
        let ps: any[] = [];
        x.participants.forEach((p: any) => {
            ps.push(new mongoose.Types.ObjectId(p));
        });

        await ExpeditieModel.collection.findOneAndUpdate({
            '_id': x._id
        }, {
            '$set': {
                personIds: ps
            },
            '$unset': {
                participants: true
            }
        });
    });
}
