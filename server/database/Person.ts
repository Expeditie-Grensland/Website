import {TableData, Tables} from "./Tables"
import {Expeditie} from "./Expeditie"
import PersonDocument = TableData.Person.PersonDocument
import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument

export namespace Person {




    export function createPerson(name: string): Promise<PersonDocument> {
        return Tables.Person.create(<TableData.Person.Person>{name: name})
    }

    export function getPerson(name: string): Promise<PersonDocument> {
        return Tables.Person.findOne({name: name}).exec()
    }

    export function getPersonById(id: string): Promise<PersonDocument> {
        return Tables.Person.findById(id).exec()
    }

    export function addExpeditie(expeditie: ExpeditieDocument | string): (person: PersonDocument) => Promise<PersonDocument> {
        return (person) => Tables.Person.findByIdAndUpdate(person._id, {$push: {expedities: getExpeditieId(expeditie)}}, {new: true}).exec()
    }

    export function addExpeditieById(expeditie: ExpeditieDocument | string): (personId: string) => Promise<PersonDocument> {
        return (personId) => Tables.Person.findByIdAndUpdate(personId, {$push: {expedities: getExpeditieId(expeditie)}}, {new: true}).exec()
    }

    function getExpeditieId(expeditie: ExpeditieDocument | string): string {
        if(typeof expeditie === "string") {
            return <string>expeditie
        }
        return (<ExpeditieDocument>expeditie)._id
    }
}