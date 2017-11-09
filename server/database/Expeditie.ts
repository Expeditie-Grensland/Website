import {TableData, Tables} from "./Tables"
import {ObjectID} from "bson"
import {Countries} from "./Countries"
import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument
import PersonDocument = TableData.Person.PersonDocument

export namespace Expeditie {

    import Country = Countries.Country
    const expeditiesError = Promise.reject("The expedities variable has not been initialized! Are you accessing it directly?")
    let expedities: Promise<ExpeditieDocument[]> = expeditiesError

    export function getExpedities(): Promise<ExpeditieDocument[]> {
        return expedities.catch(() => {
            expedities = Tables.Expeditie.find({}).sort({sequenceNumber: 1}).exec()

            return expedities
        })
    }

    function expeditiesChanged<T>(arg: T): Promise<T> {
        expedities = expeditiesError

        console.log("Invalidating Expeditie cache.")

        return Promise.resolve(arg)
    }

    export function getExpeditieById(_id: string | ObjectID): Promise<ExpeditieDocument> {
        return Tables.Expeditie.findOne({_id: _id}).exec()
    }

    //Note: this is going to give the wrong number if an expeditie is being added to the table when calling this.
    export function getNextAvailableSequenceNumber(expedities: ExpeditieDocument[]): Promise<number> {
        return new Promise((resolve) => {
            let maxSequenceNumber = -1

            for(let expeditie of expedities) {
                if(expeditie.sequenceNumber > maxSequenceNumber) {
                    maxSequenceNumber = expeditie.sequenceNumber
                }
            }
            resolve(maxSequenceNumber + 1)
        })
    }

    export function createExpeditie(name, nameShort, subtitle, color, participants): Promise<ExpeditieDocument> {
        return getExpedities().then(getNextAvailableSequenceNumber).then((sequenceNumber) => {
            return Tables.Expeditie.create(<TableData.Expeditie.Expeditie>{
                name:           name,
                nameShort:      nameShort,
                sequenceNumber: sequenceNumber,
                subtitle:       subtitle,
                color:          color,
                participants:   participants,
                countries:      ["Netherlands"]
            })
        }).then(expeditiesChanged)
    }

    export function removeExpeditieById(_id: string | ObjectID): Promise<void> {
        return getExpeditieById(_id).then(removeExpeditie)
    }

    export function removeExpeditie(expeditie: ExpeditieDocument): Promise<void> {
        return expeditie.remove().then(expeditiesChanged).then(() => {
            return undefined
        })
    }

    export function addParticipants(...persons: PersonDocument[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pushAll: {participants: persons.map(p => p._id)}}, {new: true}).exec().then(expeditiesChanged)
    }

    export function removeParticipants(...persons: PersonDocument[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pullAll: {participants: persons.map(p => p._id)}}, {new: true}).exec().then(expeditiesChanged)
    }

    export function addCountries(...countries: Country[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pushAll: {countries: countries.map(c => c.id)}}, {new: true}).exec().then(expeditiesChanged)
    }

    export function removeCountries(...countries: Country[]): (expeditie: ExpeditieDocument) => Promise<ExpeditieDocument> {
        return (expeditie) => Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$pullAll: {countries: countries.map(c => c.id)}}, {new: true}).exec().then(expeditiesChanged)
    }
}