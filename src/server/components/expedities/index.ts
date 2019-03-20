import { People } from '../people';
import { Util } from '../documents/util';
import { Expeditie, ExpeditieDocument, ExpeditieModel, ExpeditieOrID } from './model';
import { PersonOrID } from '../people/model';
import { MediaFileOrId, MediaFiles } from '../mediaFiles';
import { Documents } from '../documents/new';
import * as R from 'ramda';
import { GeoLocationDocument, geoLocationModel } from '../geoLocations/model';
import { GeoNode, GeoNodeDocument, geoNodeModel } from '../geoNodes/model';
import { GeoNodes } from '../geoNodes';

const sprintf = require('sprintf-js').sprintf;

export namespace Expedities {
    export const getByNameShort = (nameShort: string): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findOne({ nameShort }).exec();

    export const getAll = (): Promise<ExpeditieDocument[]> =>
        ExpeditieModel
            .find({})
            .sort({ sequenceNumber: -1 })
            .exec();

    export const getById = (id: string): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findById(id).exec();

    export const getDocument = (location: ExpeditieOrID): Promise<ExpeditieDocument | null> =>
        Util.getDocument(getById)(location);

    const _addExpeditieToPersons = (persons: PersonOrID[], expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        Promise.all(persons.map(People.addExpeditieR(R.__, expeditie)))
            .then(() => getDocument(expeditie).then(Documents.ensureNotNull));

    const _addExpeditieToPersonsR = R.curry(_addExpeditieToPersons);

    export const create = (expeditie: Expeditie): Promise<ExpeditieDocument> =>
        Promise.resolve(expeditie)
            .then(ExpeditieModel.create)
            .then(_addExpeditieToPersonsR(expeditie.participants));

    export const setFinished = (expeditie: ExpeditieOrID, finished: boolean): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findByIdAndUpdate(
            Util.getObjectID(expeditie),
            { finished: finished },
            { new: true }
        ).exec();

    const _checkFinished = (expeditie: ExpeditieDocument): Promise<ExpeditieDocument> => {
        if (expeditie.finished)
            throw sprintf('Sorry, de expeditie %s is gemarkeerd als beëindigd', expeditie.name);
        return Promise.resolve(expeditie);
    };

    export const remove = (expeditie: ExpeditieOrID): Promise<void> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(expeditie => removeParticipants(expeditie, expeditie.participants))
            .then(expeditie => expeditie.remove())
            .then(() => undefined);

    export const addParticipants = (expeditie: ExpeditieOrID, participants: PersonOrID[]): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(_addExpeditieToPersonsR(participants))
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                {
                    $addToSet: {
                        participants: { $each: Util.getObjectIDs(participants) }
                    }
                },
                { new: true }
            ).exec())
            .then(Documents.ensureNotNull);

    export const addParticipantsR = R.curry(addParticipants);

    const _removeExpeditieFromPersons = (expeditie: ExpeditieOrID, persons: PersonOrID[]): Promise<ExpeditieDocument> =>
        Promise.all(persons.map(People.removeExpeditieR(R.__, expeditie)))
            .then(() => getDocument(expeditie))
            .then(Documents.ensureNotNull);

    const _removeExpeditieFromPersonsR = R.curry(_removeExpeditieFromPersons);

    export const removeParticipants = (expeditie: ExpeditieOrID, participants: PersonOrID[]): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(_removeExpeditieFromPersonsR(R.__, participants))
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                {
                    $pullAll: {
                        participants: Util.getObjectIDs(participants)
                    }
                },
                { new: true }
            ).exec())
            .then(Documents.ensureNotNull);

    export const getLocations = (expeditie: ExpeditieOrID): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({ expeditieId: Util.getObjectID(expeditie) }).exec();

    export const getNodes = (expeditie: ExpeditieOrID): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({ expeditieId: Util.getObjectID(expeditie) }).exec();

    export const getCurrentNodes = (expeditie: ExpeditieOrID): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({ expeditieId: Util.getObjectID(expeditie), timeTill: Number.POSITIVE_INFINITY }).exec();

    export const setGroups = async (expeditie: ExpeditieOrID, groups: PersonOrID[][], time: number): Promise<void> => {
        const oldNodes = await getCurrentNodes(expeditie);
        const oldGroups = oldNodes.map(n => Util.getRealObjectIDs(<any>n.personIds).sort());

        if (Math.max(...oldNodes.map(n => n.timeFrom!)) >= time)
            throw new Error('The time should not be set lower than the start time of some current nodes.');

        const newGroups = groups.map(g => Util.getRealObjectIDs(g).sort());

        if (R.difference(R.flatten(oldGroups), R.flatten(newGroups)).length > 0)
            throw new Error('All people in the expeditie should be represented in the new groups.');

        const newPeopleNodes: GeoNode[] = [];
        const newPeople = R.difference(R.flatten(newGroups), R.flatten(oldGroups));

        if (newPeople.length > 0) await addParticipants(expeditie, newPeople.map(p => p.toHexString())); // TOOD: change when ObjectIds

        for (let newPerson of newPeople) newPeopleNodes.push({
            expeditieId: Util.getRealObjectID(expeditie),
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
                    expeditieId: Util.getRealObjectID(expeditie),
                    personIds: newGroup,
                    timeFrom: time
                });
        }

        for (let i = 0; i < oldGroups.length; i++)
            if (oldGroupsNotToUpdate.indexOf(i) < 0)
                await geoNodeModel.findByIdAndUpdate(oldNodes[i]._id, { $set: { timeTill: time } });

        await GeoNodes.createMany(R.concat(newNodes, newPeopleNodes));
    };

    export const setBackgroundFile = (expeditie: ExpeditieOrID, file: MediaFileOrId): Promise<ExpeditieDocument | null> =>
        MediaFiles.ensureMime(file, ['image/jpeg'])
            .then(MediaFiles.getEmbed)
            .then(embed => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                { backgroundFile: embed },
                { new: true })
                .exec());

    export const setMovieCoverFile = (expeditie: ExpeditieOrID, file: MediaFileOrId): Promise<ExpeditieDocument | null> =>
        MediaFiles.ensureMime(file, ['image/jpeg'])
            .then(MediaFiles.getEmbed)
            .then(embed => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                { movieCoverFile: embed },
                { new: true })
                .exec());

    export const setMovieFile = (expeditie: ExpeditieOrID, file: MediaFileOrId): Promise<ExpeditieDocument | null> =>
        MediaFiles.ensureMime(file, ['video/mp4'])
            .then(MediaFiles.getEmbed)
            .then(embed => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                { movieFile: embed },
                { new: true })
                .exec());
}
