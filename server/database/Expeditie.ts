import {TableData, Tables} from "./Tables"
import {ObjectID} from "bson"
import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument
import PersonDocument = TableData.Person.PersonDocument

export namespace Expeditie {

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

        return Promise.resolve(arg)
    }

    export function getExpeditieById(_id: string | ObjectID): Promise<ExpeditieDocument> {
        return Tables.Expeditie.findOne({_id: _id}).exec()
    }

    export function getNextAvailableSequenceNumber(expedities: ExpeditieDocument[]): Promise<number> {
        return new Promise((resolve, reject) => {
            if(expedities.length == 0) {
                reject("getNextAvailableSequenceNumber failed because the expedities array is empty")
            }

            let maxSequenceNumber = -1

            for(let expeditie of expedities) {
                if(expeditie.sequenceNumber > maxSequenceNumber) {
                    maxSequenceNumber = expeditie.sequenceNumber
                }
            }
            return maxSequenceNumber
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

    export function addParticipants(expeditie: ExpeditieDocument, ...persons: PersonDocument[]): Promise<ExpeditieDocument> {
        return Tables.Expeditie.findByIdAndUpdate(expeditie._id, {$push: {participants: {$each: persons.map(p => p._id)}}}).exec()
    }
}