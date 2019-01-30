import * as express from 'express';
import * as R from 'ramda';

import { EarnedPoints } from '../../components/earnedPoints';
import { ExpeditieDocument } from '../../components/expedities/model';
import { EarnedPointDocument } from '../../components/earnedPoints/model';
import { OffsetDates } from '../../components/offsetDate';
import { PersonDocument } from '../../components/people/model';

export const router = express.Router();

router.get('/', async (req, res) => {
    const earnedPoints = R.pipe(
        R.map((x: EarnedPointDocument) => {
            return {
                date: OffsetDates.getDateDDMM(x.date),
                amount: x.amount,
                name: (<PersonDocument>x.personId).name,
                team: (<PersonDocument>x.personId).team,
                expeditie: x.expeditieId ? (<ExpeditieDocument>x.expeditieId).name : ''
            };
        }),
        // @ts-ignore
        R.groupWith(R.eqProps('expeditie'))
    )(await EarnedPoints.getAllPopulated());

    console.log(earnedPoints);

    res.render('members/points', { earnedPoints });
});
