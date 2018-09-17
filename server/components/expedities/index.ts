import * as i18next from 'i18next';

import { Locations } from '../locations';
import { People } from '../people';
import { Routes } from '../routes';
import { Util } from '../documents/util';
import { ExpeditieDocument, ExpeditieOrID, ExpeditieModel, Expeditie } from './model';
import { PersonDocument, PersonOrID } from '../people/model';
import { RouteDocument, RouteOrID } from '../routes/model';
import { Location, LocationDocument } from '../locations/model';

const sprintf = require('sprintf-js').sprintf;

export namespace Expedities {
    let expeditiesCached = null;

    export function getCached(): Promise<ExpeditieDocument[]> {
        if (expeditiesCached === null) {
            expeditiesCached = getAll();
        }

        return expeditiesCached;
    }

    export function getByNameShort(nameShort: string): Promise<ExpeditieDocument> {
        return ExpeditieModel.findOne({ nameShort: nameShort }).exec();
    }

    function onChanged<T>(arg: T): Promise<T> {
        expeditiesCached = getAll();

        console.info('Invalidating Expeditie cache.');

        return Promise.resolve(arg);
    }

    export function getAll(): Promise<ExpeditieDocument[]> {
        return ExpeditieModel.find({})
            .sort({ sequenceNumber: -1 })
            .exec();
    }

    export function getById(_id: string): Promise<ExpeditieDocument> {
        return ExpeditieModel.findById(_id).exec();
    }

    export function getDocument(expeditie: ExpeditieOrID): Promise<ExpeditieDocument> {
        return Util.getDocument(expeditie, getById);
    }

    export function create(expeditie: Expeditie): Promise<ExpeditieDocument> {
        return Promise.resolve()
            .then(() => {
                if (expeditie.finished === undefined) {
                    expeditie.finished = false;
                }

                if (expeditie.route == undefined) {
                    return Routes.create({})
                        .then(route => {
                            expeditie.route = Util.getObjectID(route);

                            return expeditie;
                        })
                        .catch(err => {
                            console.warn('Creating route failed!', err);
                            return expeditie;
                        });
                }

                return expeditie;
            })
            .then(expeditie => {
                return ExpeditieModel.create(expeditie);
            })
            .then(expeditie => {
                let promises: Promise<PersonDocument>[] = [];

                for (let person of expeditie.participants) {
                    promises.push(People.addExpeditie(expeditie)(person));
                }

                return Promise.all(promises).then(() => {
                    return expeditie;
                });
            })
            .then(onChanged);
    }

    export function setFinished(finished: boolean): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            getDocument(expeditie).then(expeditie =>
                ExpeditieModel.findByIdAndUpdate(Util.getObjectID(expeditie), { finished: finished }, { new: true }).exec()
            );
    }

    export function checkFinished(actionVerb: string): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            new Promise((resolve, reject) => {
                return getDocument(expeditie).then(expeditie => {
                    if (expeditie.finished) {
                        reject(sprintf(i18next.t('expeditie_finished_generic_error'), actionVerb, expeditie.name));
                    }
                    resolve(expeditie);
                });
            });
    }

    export function remove(expeditie: ExpeditieOrID): Promise<void> {
        return getDocument(expeditie)
            .then(expeditie => removeParticipants(expeditie.participants)(expeditie))
            .then(expeditie => expeditie.remove())
            .then(onChanged)
            .then(() => undefined);
    }

    export function addParticipants(participants: PersonOrID[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished('expeditie_action_add_participants')(expeditie)
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

    export function removeParticipants(participants: PersonOrID[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished('expeditie_action_remove_participants')(expeditie)
                .then(expeditie => Promise.all(participants.map(People.removeExpeditie(expeditie))))
                .then(() =>
                    ExpeditieModel.findByIdAndUpdate(
                        Util.getObjectID(expeditie),
                        { $pullAll: { participants: Util.getObjectIDs(participants) } },
                        { new: true }
                    ).exec()
                );
    }

    export function setRoute(route: RouteOrID): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished('expeditie_action_set_route')(expeditie).then(expeditie =>
                ExpeditieModel.findByIdAndUpdate(Util.getObjectID(expeditie), { route: Util.getObjectID(route) }, { new: true }).exec()
            );
    }

    export function getRoute(expeditie: ExpeditieOrID): Promise<RouteDocument> {
        return Util.getDocument(expeditie, getById).then(expeditie => Util.getDocument(expeditie.route, Routes.getById));
    }

    export function setGroups(groups: PersonOrID[][]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return (expeditie: ExpeditieOrID) =>
            checkFinished('expeditie_action_set_groups')(expeditie).then(expeditie => {
                const pExpeditie = Util.getDocument(expeditie, getById);
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
            checkFinished('expeditie_action_add_location')(expeditie).then(expeditie => {
                return Locations.create(location, expeditie.route).then(location => expeditie);
            });
    }

    export function addLocations(locations: Location[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished('expeditie_action_add_locations')(expeditie).then(expeditie => {
                return Locations.createMany(locations, expeditie.route).then(() => expeditie);
            });
    }

    export function getLocations(expeditie: ExpeditieOrID): Promise<LocationDocument[]> {
        return getRoute(expeditie).then(Locations.getInRoute);
    }

    export function getLocationsSortedByVisualArea(expeditie: ExpeditieOrID, skip, limit): Promise<LocationDocument[]> {
        return getRoute(expeditie).then(Locations.getInRouteSortedByArea(skip, limit));
    }
}
