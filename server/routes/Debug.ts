import * as express from "express"
import {Person} from "../database/Person"
import {Expeditie} from "../database/Expeditie"
import {Countries} from "../database/Countries"

export namespace Debug {


    import Country = Countries.Country

    export function init(app: express.Express) {

        app.get('/generate_people', (req, res) => {
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

            const noordkaapPromise = noordkaapPersonPromise.then((persons) => {
                console.log("Noordkaap people successfully retrieved!")
                return Expeditie.createExpeditie('Noordkaap', 'noordkaap', '2015', '#377eb8', persons)
            }).then(Expeditie.addCountries(...[
                'Germany', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark'
            ].map((s) => <Country>{id: s}))).then((expeditie) => {
                console.log("Noordkaap expeditie successfully created!")
                return expeditie
            }).then((expeditie) => expeditie.populate('participants').execPopulate())

            const balkanPromise = balkanPersonPromise.then((persons) => {
                console.log("Balkan people successfully retrieved!")
                return Expeditie.createExpeditie('Balkan', 'balkan', '2016', '#e41a1c', persons)
            }).then(Expeditie.addCountries(...[
                'Germany', 'Austria', 'Slovenia', 'Croatia', 'Bosnia and Herz.', 'Montenegro', 'Albania', 'Kosovo', 'Macedonia', 'Greece', 'Bulgaria', 'Romania', 'Moldova', 'Hungary', 'Slovakia', 'Czech Rep.'
            ].map((s) => <Country>{id: s}))).then((expeditie) => {
                console.log("Balkan expeditie successfully created!")
                return expeditie
            }).then(Expeditie.removeCountries(<Country>{id: 'Netherlands'})).then((expeditie) => expeditie.populate('participants').execPopulate())

            Promise.all([noordkaapPromise, balkanPromise]).then(([noordkaap, balkan]) => {
                noordkaap.populate('participants').execPopulate().then((noordkaap) => {
                    console.log('res.send')
                    res.send(noordkaap + "<br><br>" + balkan)
                })
            })
        })
    }
}