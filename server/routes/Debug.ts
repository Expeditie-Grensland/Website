import * as express from "express"
import {Person} from "../database/Person"
import {Expeditie} from "../database/Expeditie"

export namespace Debug {


    export function init(app: express.Express) {

        app.get('/generate_users', (req, res) => {
            let users = ["Maurice Meedendorp", "Ronald Kremer", "Diederik Blaauw", "Matthijs Nuus", "Martijn Atema", "Martijn Bakker", "Robert Sandee", "Robert Slomp"]

            users.forEach(name => {
                const promise = Person.createPerson(name)

                promise.then(person => {
                    console.log(person.name + " successfully created!")
                })
            })

            res.send('Hello there!')
        })

        app.get('/generate_expedities', (req, res) => {
            let maurice = Person.getPerson("Maurice Meedendorp")
            let ronald = Person.getPerson("Ronald Kremer")
            let diederik = Person.getPerson("Diederik Blaauw")
            let matthijs = Person.getPerson("Matthijs Nuus")
            let martijnA = Person.getPerson("Martijn Atema")
            let martijnB = Person.getPerson("Martijn Bakker")
            let robertSan = Person.getPerson("Robert Sandee")
            let robertSl = Person.getPerson("Robert Slomp")

            let noordkaapPersonPromise = Promise.all([maurice, ronald, diederik, martijnA, martijnB, robertSan])
            let balkanPersonPromise = Promise.all([maurice, ronald, diederik, martijnA, robertSan, matthijs, robertSl])
            /**
            noordkaapPersonPromise.then((res) => {
                Expeditie.createExpeditie('Noordkaap', 'noordkaap', '2015', '#377eb8', res, [
                    'Germany', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark'
                ])
            })

            balkanPersonPromise.then((res) => {
                Expeditie.createExpeditie('Balkan', 'balkan', '2016', '#e41a1c', res, [
                    'Germany', 'Austria', 'Slovenia', 'Croatia', 'Bosnia and Herz.', 'Montenegro', 'Albania', 'Kosovo', 'Macedonia', 'Greece', 'Bulgaria', 'Romania', 'Moldova', 'Hungary', 'Slovakia', 'Czech Rep.'
                ])
            })
            **/

            res.send('Hello there!')
        })
    }
}