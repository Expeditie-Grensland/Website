import {TableData, Tables} from "./Tables"

export namespace Person {

    import PersonDocument = TableData.Person.PersonDocument

    export function createPerson(name: string): Promise<PersonDocument> {
        return Tables.Person.create(<TableData.Person.Person>{name: name})
    }

    export function getPerson(name: string): Promise<PersonDocument> {
        return Tables.Person.findOne({name: name}).exec()
    }
}