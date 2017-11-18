import {TableData, Tables} from "./Tables"
import {ObjectID} from "bson"
import {Countries} from "./Countries"
import {Person} from "./Person"
import {Route} from "./Route"
import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument
import PersonDocument = TableData.Person.PersonDocument
import Country = Countries.Country
import Expeditie = TableData.Expeditie.Expeditie
import {Util} from "./Util"


export namespace Expeditie {

    import PersonOrID = Person.PersonOrID
    import RouteOrID = Route.RouteOrID
    import RouteDocument = TableData.Route.RouteDocument
    export type ExpeditieOrID = Util.DocumentOrID<ExpeditieDocument>

    const expeditiesError = Promise.reject("The expedities variable has not been initialized! Are you accessing it directly?")
    let expedities: Promise<ExpeditieDocument[]> = expeditiesError

    export function getExpeditiesCached(): Promise<ExpeditieDocument[]> {
        return expedities.catch(() => {
            expedities = Tables.Expeditie.find({},
                'sequenceNumber name nameShort subtitle color background showMap mapUrl movieUrl movieCoverUrl countries'
            ).sort({sequenceNumber: 1}).exec()

            return expedities
        })
    }

    function expeditiesChanged<T>(arg: T): Promise<T> {
        expedities = expeditiesError

        console.log("Invalidating Expeditie cache.")

        return Promise.resolve(arg)
    }

    export function getExpedities(): Promise<ExpeditieDocument[]> {
        return Tables.Expeditie.find({}).sort({sequenceNumber: 1}).exec()
    }

    export function getExpeditieById(_id: string | ObjectID): Promise<ExpeditieDocument> {
        return Tables.Expeditie.findOne({_id: _id}).exec()
    }

    export function createExpeditie(expeditie: Expeditie): Promise<ExpeditieDocument> {
        return Promise.resolve().then(() => {
            if(expeditie.mapUrl == undefined) {
                expeditie.mapUrl = '/' + expeditie.nameShort
            }

            if(expeditie.route == undefined) {
                return Route.createRoute({}).then((route) => {
                    expeditie.route = route

                    return expeditie
                }).catch((err) => {
                    console.log("Creating route failed! " + err)
                    return expeditie
                })
            }

            return expeditie
        }).then((expeditie) => {
            return Tables.Expeditie.create(expeditie)
        }).then((expeditie) => {
            let promises: Promise<PersonDocument>[]

            for(let personId of Util.getDocumentIds(expeditie.participants)) {
                promises.push(Person.addExpeditie(expeditie)(personId))
            }

            return Promise.all(promises).then(() => {
                return expeditie
            })
        }).then(expeditiesChanged)
    }

    export function removeExpeditie(expeditie: ExpeditieDocument): Promise<void> {
        return removeParticipants(expeditie.participants)(expeditie).then((expeditie) => expeditie.remove()).then(expeditiesChanged).then(() => {
            return undefined
        })
    }

    export function addParticipants(persons: Person.PersonOrID[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => {
            for(let personId of Util.getDocumentIds(persons)) {
                Person.addExpeditie(expeditie)(personId)
            }
            return Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pushAll: {participants: Util.getDocumentIds(persons)}}, {new: true}).exec()
        }
    }

    export function removeParticipants(persons: Person.PersonOrID[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => {
            for(let person of Util.getDocumentIds(persons)) {
                Tables.Person.findByIdAndUpdate(person, {$pull: {expedities: expeditie._id}}).exec()
            }
            return Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pullAll: {participants: Util.getDocumentIds(persons)}}, {new: true}).exec()
        }
    }

    export function addCountries(...countries: Country[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pushAll: {countries: countries.map(c => c.id)}}, {new: true}).exec().then(expeditiesChanged)
    }

    export function removeCountries(...countries: Country[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pullAll: {countries: countries.map(c => c.id)}}, {new: true}).exec().then(expeditiesChanged)
    }

    export function setRoute(route: RouteOrID): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie => Tables.Expeditie.findByIdAndUpdate(Util.getDocumentId(expeditie), {route: Util.getObjectID(route)}, {new: true}).exec()

    }

    export function setGroups(groups: PersonOrID[][]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return (expeditie: ExpeditieOrID) => {
            const pExpeditie = Util.getDocument(expeditie, getExpeditieById)
            const pRoute = pExpeditie.then((expeditie) => {
                return Util.getDocument(expeditie.route, Route.getRouteById).catch(() => {
                    return Route.createRoute({}).then(route => setRoute(route)(expeditie))
                })
            }).then(Route.setGroups(expeditie, groups))

            return Promise.all([pExpeditie, pRoute]).then(([expeditie, route]) => {
                return setRoute(route)(expeditie)
            })
        }
    }
}