import {TableData, Tables} from "./Tables"
import {ObjectID} from "bson"
import {Countries} from "./Countries"
import {Person} from "./Person"
import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument
import PersonDocument = TableData.Person.PersonDocument
import Country = Countries.Country
import Expeditie = TableData.Expeditie.Expeditie


export namespace Expeditie {

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
        if(expeditie.mapUrl == undefined) {
            expeditie.mapUrl = '/' + expeditie.nameShort
        }

        //TODO assign route variable.

        return Tables.Expeditie.create(expeditie).then((expeditie) => {
            for(let personId of getPersonId(expeditie.participants)) {
                Person.addExpeditieById(expeditie)(personId)
            }

            return expeditie
        }).then(expeditiesChanged)
    }

    export function removeExpeditie(expeditie: ExpeditieDocument): Promise<void> {
        return removeParticipants(expeditie.participants)(expeditie).then((expeditie) => expeditie.remove()).then(expeditiesChanged).then(() => {
            return undefined
        })
    }

    export function addParticipants(persons: PersonDocument[] | string[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => {
            for(let personId of getPersonId(persons)) {
                Person.addExpeditieById(expeditie)(personId)
            }
            return Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pushAll: {participants: getPersonId(persons)}}, {new: true}).exec().then(expeditiesChanged)
        }
    }

    export function removeParticipants(persons: PersonDocument[] | string[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => {
            for(let person of getPersonId(persons)) {
                Tables.Person.findByIdAndUpdate(person, {$pull: {expedities: expeditie._id}}).exec()
            }
            return Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pullAll: {participants: getPersonId(persons)}}, {new: true}).exec().then(expeditiesChanged)
        }
    }

    function getPersonId(persons: PersonDocument[] | string[]): string[] {
        if(persons.length == 0) {
            return []
        }

        if(typeof(persons[0]) == "string") {
            return <string[]>persons
        }

        return (<PersonDocument[]>persons).map((p) => p._id)
    }

    export function addCountries(...countries: Country[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pushAll: {countries: countries.map(c => c.id)}}, {new: true}).exec().then(expeditiesChanged)
    }

    export function removeCountries(...countries: Country[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pullAll: {countries: countries.map(c => c.id)}}, {new: true}).exec().then(expeditiesChanged)
    }
}