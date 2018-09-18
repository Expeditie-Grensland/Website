import { Locations } from '../locations';
import { People } from '../people';
import { Routes } from '../routes';
import { Util } from '../documents/util';
import { Expeditie, ExpeditieDocument, ExpeditieModel, ExpeditieOrID } from './model';
import { PersonOrID } from '../people/model';
import { RouteDocument, RouteOrID } from '../routes/model';
import { Location, LocationDocument } from '../locations/model';
import { aPipe } from '../../helpers/functionalHelper';
import * as i18next from 'i18next';

const sprintf = require('sprintf-js').sprintf;

export namespace Expedities {
    export const getByNameShort = (nameShort: string): Promise<ExpeditieDocument> =>
        ExpeditieModel.findOne({ nameShort }).exec();

    export const getAll = (): Promise<ExpeditieDocument[]> =>
        ExpeditieModel
            .find({})
            .sort({ sequenceNumber: -1 })
            .exec();

    export const getById = (id: string): Promise<ExpeditieDocument> =>
        ExpeditieModel.findById(id).exec();

    export const getDocument: ((location: ExpeditieOrID) => Promise<ExpeditieDocument>) =
        Util.getDocument(getById);

    const _createNewRouteIfUndefined = (expeditie: Expeditie): Promise<Expeditie> => {
        if (expeditie.route !== undefined)
            return Promise.resolve(expeditie);

        return Routes.create({})
            .then(route => expeditie.route = Util.getObjectID(route))
            .catch(err => console.error('Creating route failed!', err))
            .then(() => expeditie);
    };

    const _addExpeditieToParticipants = (expeditie: ExpeditieDocument): Promise<ExpeditieDocument> =>
        Promise.all(expeditie.participants.map(People.addExpeditie(expeditie)))
            .then(() => expeditie);

    export const create: ((expeditie: Expeditie) => Promise<ExpeditieDocument>) = aPipe(
        _createNewRouteIfUndefined,
        ExpeditieModel.create,
        _addExpeditieToParticipants
    );

    export const setFinished = (finished: boolean) =>
        (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
            getDocument(expeditie).then(expeditie => expeditie.set({ finished }).save());

    export const checkFinished = (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie).then(expeditie => {
            if (expeditie.finished)
                throw sprintf(i18next.t('expeditie_finished_generic_error'), expeditie.name);
            return expeditie;
        });

    export const remove: ((expeditie: ExpeditieOrID) => Promise<void>) = aPipe(
        getDocument,
        expeditie => removeParticipants(expeditie.participants)(expeditie),
        expeditie => expeditie.remove(),
        () => undefined
    );

    // FIXME: $pushAll is deprecated (?)
    export function addParticipants(participants: PersonOrID[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished(expeditie)
                .then(expeditie => Promise.all(participants.map(People.addExpeditie(expeditie))))
                .then(() =>
                    ExpeditieModel.findByIdAndUpdate(
                        Util.getObjectID(expeditie),
                        {
                            $pushAll: {
                                participants: Util.getObjectIDs(participants)
                            }
                        },
                        { new: true }
                    )
                );
    }

    export function removeParticipants(participants: PersonOrID[]): ((expeditie: ExpeditieOrID) => Promise<ExpeditieDocument>) {
        return expeditie =>
            checkFinished(expeditie)
                .then(expeditie => Promise.all(participants.map(People.removeExpeditie(expeditie))))
                .then(() =>
                    ExpeditieModel.findByIdAndUpdate(
                        Util.getObjectID(expeditie),
                        { $pullAll: { participants: Util.getObjectIDs(participants) } },
                        { new: true }
                    ).exec()
                );
    }

    export function setRoute(route: RouteOrID): ((expeditie: ExpeditieOrID) => Promise<ExpeditieDocument>) {
        return expeditie =>
            checkFinished(expeditie).then(expeditie =>
                ExpeditieModel.findByIdAndUpdate(Util.getObjectID(expeditie), { route: Util.getObjectID(route) }, { new: true }).exec()
            );
    }

    export function getRoute(expeditie: ExpeditieOrID): Promise<RouteDocument> {
        return Util.getDocument(getById)(expeditie).then(expeditie => Util.getDocument(Routes.getById)(expeditie.route));
    }

    export function setGroups(groups: PersonOrID[][]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return (expeditie: ExpeditieOrID) =>
            checkFinished(expeditie).then(expeditie => {
                const pExpeditie = Util.getDocument(getById)(expeditie);
                const pRoute = pExpeditie
                    .then(expeditie => {
                        if (expeditie.route === undefined) {
                            return Routes.create({}).then(route => {
                                setRoute(route)(expeditie);
                                return route;
                            });
                        }

                        return Routes.getDocument(expeditie.route);
                    })
                    .then(route => Routes.setGroups(expeditie, groups));

                return Promise.all([pExpeditie, pRoute]).then(([expeditie, route]) => {
                    return expeditie;
                });
            });
    }

    export function addLocation(location: Location): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished(expeditie).then(expeditie => {
                return Locations.create(location, expeditie.route).then(location => expeditie);
            });
    }

    export function addLocations(locations: Location[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished(expeditie).then(expeditie => {
                return Locations.createMany(locations, expeditie.route).then(() => expeditie);
            });
    }

    export const getLocations: ((expeditie: ExpeditieOrID) => Promise<LocationDocument[]>) = aPipe(
        getRoute,
        Locations.getInRoute
    );

    export const getLocationsSortedByVisualArea = (expeditie: ExpeditieOrID, skip: number, limit: number): Promise<LocationDocument[]> =>
        getRoute(expeditie)
            .then(Locations.getInRouteSortedByArea(skip, limit));
}
