import * as turf from '@turf/turf';
import * as R from 'ramda';

import { GeoLocation, GeoLocationDocument, geoLocationModel, GeoLocationOrId } from './model';
import { Documents } from '../documents/new';

export namespace VisualAreaHelper {
    const getLastLocations = (loc: GeoLocation): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({ personId: loc.personId, expeditieId: loc.expeditieId })
            .sort({ time: 'desc' }).limit(2).exec();

    const calculateVisualArea = (locBefore: GeoLocation, loc: GeoLocation, locAfter: GeoLocation): number =>
        turf.area(turf.polygon([
            [
                [locBefore.longitude, locBefore.latitude],
                [loc.longitude, loc.latitude],
                [locAfter.longitude, locAfter.latitude],
                [locBefore.longitude, locBefore.latitude]
            ]
        ]));

    const updateVisualArea = (loc: GeoLocationOrId, visualArea: number): Promise<GeoLocationDocument | null> =>
        geoLocationModel.findByIdAndUpdate(Documents.getObjectId(loc), { $set: { visualArea } }).exec();

    export const setVisualArea = async (loc: GeoLocation): Promise<GeoLocation> => {
        const prevLocs = await getLastLocations(loc);

        if (prevLocs.length == 2) {
            updateVisualArea(prevLocs[0], calculateVisualArea(prevLocs[1], prevLocs[0], loc));
        }

        return loc;
    };

    const groupByKey: ((locs: GeoLocation[]) => { [key: string]: GeoLocation[] }) =
        R.groupBy((loc: GeoLocation) => Documents.getStringIds([loc.expeditieId, loc.personId]).toString());

    const sortByTime: ((locs: GeoLocation[]) => GeoLocation[]) =
        R.sort((loc1: GeoLocation, loc2: GeoLocation) => loc1.time - loc2.time);

    const setVisualAreasOnOrdered = async (locs: GeoLocation[]): Promise<GeoLocation[]> => {
        const prevLocs = await getLastLocations(locs[0]);

        if (prevLocs.length == 2) {
            updateVisualArea(prevLocs[0], calculateVisualArea(prevLocs[1], prevLocs[0], locs[0]));
        }

        locs[locs.length - 1].visualArea = Number.POSITIVE_INFINITY;

        if (prevLocs.length > 0) locs[-1] = prevLocs[0];
        else locs[0].visualArea = Number.POSITIVE_INFINITY;

        for (let i = locs[-1] ? 0 : 1; i < locs.length - 1; i++)
            locs[i].visualArea = calculateVisualArea(locs[i - 1], locs[i], locs[i + 1]);

        return locs.splice(0, locs.length);
    };

    export const setVisualAreas: ((locs: GeoLocation[]) => Promise<GeoLocation[]>) =
        R.pipeP(
            (x: GeoLocation[]) => Promise.resolve(x),
            groupByKey,
            R.values,
            R.map(R.pipe(
                sortByTime,
                setVisualAreasOnOrdered
            )) as ((locs: GeoLocation[][]) => Promise<GeoLocation[]>[]),
            (x: Promise<GeoLocation[]>[]) => Promise.all(x),
            R.flatten
        );
}
