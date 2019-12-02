import * as mongoose from 'mongoose';
import * as R from 'ramda';

import { Expeditie, ExpeditieDocument, ExpeditieModel, ExpeditieOrId } from './model';
import { PersonOrId } from '../people/model';
import { MediaFiles } from '../mediaFiles';
import { MediaFileOrId } from '../mediaFiles/model';
import { Documents } from '../documents';
import { GeoLocationDocument, geoLocationModel } from '../geoLocations/model';
import { GeoNode, GeoNodeDocument, geoNodeModel } from '../geoNodes/model';
import { GeoNodes } from '../geoNodes';

const sprintf = require('sprintf-js').sprintf;

export namespace Expedities {
    export const getByNameShort = (nameShort: string): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findOne({ nameShort }).exec();

    export const getByNameShortWithPeople = (nameShort: string): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findOne({ nameShort }).populate('personIds').exec();

    export const getAll = (): Promise<ExpeditieDocument[]> =>
        ExpeditieModel
            .find({})
            .sort({ sequenceNumber: -1 })
            .exec();

    export const getById = (id: mongoose.Types.ObjectId): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findById(id).exec();

    export const getDocument = (expeditie: ExpeditieOrId): Promise<ExpeditieDocument | null> =>
        Documents.getDocument(getById)(expeditie);

    export const create = (expeditie: Expeditie): Promise<ExpeditieDocument> =>
        Promise.resolve(expeditie)
            .then(ExpeditieModel.create);

    export const setFinished = (expeditie: ExpeditieOrId, finished: boolean): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findByIdAndUpdate(
            Documents.getObjectId(expeditie),
            { finished: finished },
            { new: true }
        ).exec();

    const _checkFinished = (expeditie: ExpeditieDocument): Promise<ExpeditieDocument> => {
        if (expeditie.finished)
            throw sprintf('Sorry, de expeditie %s is gemarkeerd als beëindigd', expeditie.name);
        return Promise.resolve(expeditie);
    };

    export const remove = (expeditie: ExpeditieOrId): Promise<void> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(expeditie => expeditie.remove())
            .then(() => undefined);

    export const addPeople = (expeditie: ExpeditieOrId, people: PersonOrId[]): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Documents.getObjectId(expeditie),
                {
                    $addToSet: {
                        personIds: { $each: Documents.getObjectIds(people) }
                    }
                },
                { new: true }
            ).exec())
            .then(Documents.ensureNotNull);


    export const removePeople = (expeditie: ExpeditieOrId, people: PersonOrId[]): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Documents.getObjectId(expeditie),
                {
                    $pullAll: {
                        personIds: Documents.getObjectIds(people)
                    }
                },
                { new: true }
            ).exec())
            .then(Documents.ensureNotNull);

    export const getLocations = (expeditie: ExpeditieOrId): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({ expeditieId: Documents.getObjectId(expeditie) }).exec();

    export const getLocationCount = (expeditie: ExpeditieOrId): Promise<number> =>
        geoLocationModel.count({ expeditieId: Documents.getObjectId(expeditie) }).exec();

    export const getNodes = (expeditie: ExpeditieOrId): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({ expeditieId: Documents.getObjectId(expeditie) }).exec();

    export const getCurrentNodes = (expeditie: ExpeditieOrId): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({ expeditieId: Documents.getObjectId(expeditie), timeTill: Number.POSITIVE_INFINITY }).exec();

    export const setGroups = async (expeditie: ExpeditieOrId, groups: PersonOrId[][], time: number): Promise<void> => {
        const oldNodes = await getCurrentNodes(expeditie);
        const oldGroups = oldNodes.map(n => Documents.getObjectIds(<any>n.personIds).sort());

        if (Math.max(...oldNodes.map(n => n.timeFrom!)) >= time)
            throw new Error('The time should not be set lower than the start time of some current nodes.');

        const newGroups = groups.map(g => Documents.getObjectIds(g).sort());

        if (R.difference(R.flatten(oldGroups), R.flatten(newGroups)).length > 0)
            throw new Error('All people in the expeditie should be represented in the new groups.');

        const newPeopleNodes: GeoNode[] = [];
        const newPeople = R.difference(R.flatten(newGroups), R.flatten(oldGroups));

        if (newPeople.length > 0) await addPeople(expeditie, newPeople);

        for (let newPerson of newPeople) newPeopleNodes.push({
            expeditieId: Documents.getObjectId(expeditie),
            personIds: [newPerson],
            timeTill: time
        });

        const newNodes: GeoNode[] = [];
        const oldGroupsNotToUpdate: number[] = [];

        for (let newGroup of newGroups) {
            if (R.contains(newGroup, oldGroups))
                oldGroupsNotToUpdate.push(R.findIndex(R.equals(newGroup), oldGroups));
            else if (R.contains(newGroup, newPeople.map(x => [x])))
                newPeopleNodes[R.findIndex(R.equals(newGroup), newPeople.map(x => [x]))].timeTill = Number.POSITIVE_INFINITY;
            else
                newNodes.push({
                    expeditieId: Documents.getObjectId(expeditie),
                    personIds: newGroup,
                    timeFrom: time
                });
        }

        for (let i = 0; i < oldGroups.length; i++)
            if (oldGroupsNotToUpdate.indexOf(i) < 0)
                await geoNodeModel.findByIdAndUpdate(oldNodes[i]._id, { $set: { timeTill: time } });

        await GeoNodes.createMany(R.concat(newNodes, newPeopleNodes));
    };

    export const setBackgroundFile = (expeditie: ExpeditieOrId, file: MediaFileOrId): Promise<ExpeditieDocument | null> =>
        MediaFiles.ensureMime(file, ['image/jpeg'])
            .then(MediaFiles.getEmbed)
            .then(embed => ExpeditieModel.findByIdAndUpdate(
                Documents.getObjectId(expeditie),
                { backgroundFile: embed },
                { new: true })
                .exec());

    export const setMovieCoverFile = (expeditie: ExpeditieOrId, file: MediaFileOrId): Promise<ExpeditieDocument | null> =>
        MediaFiles.ensureMime(file, ['image/jpeg'])
            .then(MediaFiles.getEmbed)
            .then(embed => ExpeditieModel.findByIdAndUpdate(
                Documents.getObjectId(expeditie),
                { movieCoverFile: embed },
                { new: true })
                .exec());

    export const setMovieFile = (expeditie: ExpeditieOrId, file: MediaFileOrId): Promise<ExpeditieDocument | null> =>
        MediaFiles.ensureMime(file, ['video/mp4'])
            .then(MediaFiles.getEmbed)
            .then(embed => ExpeditieModel.findByIdAndUpdate(
                Documents.getObjectId(expeditie),
                { movieFile: embed },
                { new: true })
                .exec());
}
