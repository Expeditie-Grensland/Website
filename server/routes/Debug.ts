import * as express from "express"
import {Person} from "../database/Person"
import {Expeditie} from "../database/Expeditie"

export namespace Debug {

    export function init(app: express.Express) {

        app.get("/generate_people", (req, res) => {
            let users = ["Maurice Meedendorp", "Ronald Kremer", "Diederik Blaauw", "Matthijs Nuus", "Martijn Atema", "Martijn Bakker", "Robert Sandee", "Robert Slomp"]

            users.forEach(name => {
                const promise = Person.createPerson(name)

                promise.then(person => {
                    console.log(person.name + " successfully created!")
                })
            })

            res.send("Hello there!")
        })

        app.get("/generate_expedities", (req, res) => {
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
            let kaukasusPersonPromise = Promise.all([maurice, ronald, diederik, martijnA, matthijs])

            const noordkaapPromise = noordkaapPersonPromise.then((persons) => {
                console.log("Noordkaap people successfully retrieved!")
                return Expeditie.createExpeditie({
                    sequenceNumber: 0,
                    name: "Noordkaap",
                    nameShort: "noordkaap",
                    subtitle: "2015",
                    showMap: false,
                    color: "#377eb8",
                    movieUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/Nordkapp+The+Movie+720p+(Web-Optimized).mp4",
                    movieCoverUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/cover.jpg",
                    background: {
                        imageUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/background.jpg",
                        position: {
                            x: 75,
                            y: 50,
                        },
                    },
                    participants: persons.map((person) => person._id),
                    countries: [
                        "Netherlands", "Germany", "Poland", "Lithuania", "Latvia", "Estonia", "Finland", "Sweden", "Norway", "Denmark",
                    ],
                })
            }).then((expeditie) => {
                console.log("Noordkaap expeditie successfully created!")
                return expeditie
            })

            const balkanPromise = balkanPersonPromise.then((persons) => {
                console.log("Balkan people successfully retrieved!")
                return Expeditie.createExpeditie({
                    sequenceNumber: 1,
                    name: "Balkan",
                    nameShort: "balkan",
                    subtitle: "2016",
                    showMap: false,
                    color: "#e41a1c",
                    movieUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/balkan/Balkan+the+Movie+(Web-Optimized).mp4",
                    movieCoverUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/balkan/cover.jpg",
                    background: {
                        imageUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/balkan/background.jpg",
                        position: {
                            x: 66,
                            y: 50,
                        },
                    },
                    participants: persons.map((person) => person._id),
                    countries: [
                        "Netherlands", "Germany", "Austria", "Slovenia", "Croatia", "Bosnia and Herz.", "Montenegro", "Albania", "Kosovo", "Macedonia", "Greece", "Bulgaria", "Romania", "Moldova", "Hungary", "Slovakia", "Czech Rep.",
                    ],
                })
            }).then((expeditie) => {
                console.log("Balkan expeditie successfully created!")
                return expeditie
            })

            const kaukasusPromise = kaukasusPersonPromise.then((persons) => {
                return Expeditie.createExpeditie({
                    sequenceNumber: 2,
                    name: "Kaukasus",
                    nameShort: "kaukasus",
                    subtitle: "2017",
                    showMap: true,
                    color: "#ff7f00",
                    movieUrl: null,
                    movieCoverUrl: null,
                    background: {
                        imageUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/kaukasus/background.jpg",
                        position: {
                            x: 40,
                            y: 70,
                        },
                    },
                    participants: persons.map((person) => person._id),
                    countries: [
                        "Netherlands", "Iran", "Azerbaijan", "Georgia", "Armenia", "Russia", "Abkhazia", "Belarus", "Lithuania", "Belgium",
                    ],
                })
            })

            Promise.all([noordkaapPromise, balkanPromise, kaukasusPromise]).then(() => {
                res.send("Expedities generated!")
            })
        })
    }
}