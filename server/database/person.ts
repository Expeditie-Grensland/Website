import {ObjectID} from 'bson'

import {Expeditie} from './expeditie'
import {TableData, Tables} from './tables'
import {Util} from './util'

import PersonDocument = TableData.Person.PersonDocument
import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument

export namespace Person {

    import Person = TableData.Person.Person
    import ExpeditieOrID = TableData.ExpeditieOrID
    import PersonOrID = TableData.PersonOrID

    export function createPerson(person: Person): Promise<PersonDocument> {
        return Tables.Person.create(person)
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

    export function addExpeditie(expeditie: ExpeditieOrID): (person: PersonOrID) => Promise<PersonDocument> {
        return person => Tables.Person.findByIdAndUpdate(Util.getObjectID(person), {$push: {expedities: Util.getObjectID(expeditie)}}, {new: true}).exec()
    }

    export function removeExpeditie(expeditie: ExpeditieOrID): (person: PersonOrID) => Promise<PersonDocument> {
        return person => Tables.Person.findByIdAndUpdate(Util.getObjectID(person), {$pull: {expedities: Util.getObjectID(expeditie)}}, {new: true}).exec()
    }
}