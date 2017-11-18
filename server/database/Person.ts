import {TableData, Tables} from "./Tables"
import {Expeditie} from "./Expeditie"
import PersonDocument = TableData.Person.PersonDocument
import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument
import {Util} from "./Util"

export namespace Person {

    export type PersonOrID = Util.DocumentOrID<PersonDocument>

    export function createPerson(name: string): Promise<PersonDocument> {
        return Tables.Person.create(<TableData.Person.Person>{name: name})
    }

    export function getPerson(name: string): Promise<PersonDocument> {
        return Tables.Person.findOne({name: name}).exec()
    }

    export function getPersonById(id: string): Promise<PersonDocument> {
        return Tables.Person.findById(id).exec()
    }

    export function getPersonsByIds(ids: string[]): Promise<PersonDocument[]> {
        return Tables.Person.find({_id: {$in: ids}}).exec()
    }

    export function addExpeditie(expeditie: ExpeditieDocument | string): (person: PersonOrID) => Promise<PersonDocument> {
        return (person) => Tables.Person.findByIdAndUpdate(Util.getDocumentId(person), {$push: {expedities: Util.getDocumentId(expeditie)}}, {new: true}).exec()
    }
}