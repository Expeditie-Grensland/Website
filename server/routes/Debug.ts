import * as express from "express"
import {Person} from "../database/Person"
import {Expeditie} from "../database/Expeditie"
import {Config} from "../Config"
import {TableData, Tables} from "../database/Tables"
import {Util} from "../database/Util"
import {Route} from "../database/Route"

export namespace Debug {

    import PersonDocument = TableData.Person.PersonDocument

    export function init(app: express.Express) {

        if(Config.debug) {
            process.on('unhandledRejection', (reason, p) => {
                console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
                // application specific logging, throwing an error, or other logic here
            });
        }


        app.get("/generate_people", (req, res) => {
            let users = ["Maurice Meedendorp", "Ronald Kremer", "Diederik Blaauw", "Matthijs Nuus", "Martijn Atema", "Martijn Bakker", "Robert Sandee", "Robert Slomp"]
            let promises = []

            for(let name of users) {
                promises.push(Person.createPerson(name))
            }

            Promise.all(promises).then(() => res.send('People created'))
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

            let allPeoplePromise: Promise<PersonDocument[]> = Promise.all<PersonDocument>([maurice, ronald, diederik, matthijs, martijnA, martijnB, robertSan, robertSl])
            let noordkaapPersonPromise = Promise.all([maurice, ronald, diederik, martijnA, martijnB, robertSan])
            let balkanPersonPromise = Promise.all([maurice, ronald, diederik, martijnA, robertSan, matthijs, robertSl])
            let kaukasusPersonPromise1 = Promise.all([maurice, ronald, martijnA])
            let kaukasusPersonPromise2 = Promise.all([diederik, matthijs])

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
            }).then((expeditie) => {


                return expeditie.populate('participants').execPopulate()
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

            const kaukasusPromise = Promise.all([kaukasusPersonPromise1, kaukasusPersonPromise2]).then(([baku, teheran]) => {
                console.log("Kaukasus people successfully retrieved!")
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
                    participants: teheran.map((person) => person._id).concat(baku.map((p) => p._id)),
                    countries: [
                        "Netherlands", "Iran", "Azerbaijan", "Georgia", "Armenia", "Russia", "Abkhazia", "Belarus", "Lithuania", "Belgium",
                    ],
                })
            })

            Promise.all([noordkaapPromise, balkanPromise, kaukasusPromise]).then(([nk, bk, kk]) => {
                allPeoplePromise.then(([maurice, ronald, diederik, matthijs, martijnA, martijnB, robertSan, robertSl]) => {
                    console.log("Setting Kaukasus groups..")

                    let baku: Person.PersonOrID[] = [ronald, martijnA, maurice]
                    let teheran = [matthijs, diederik]
                    let moscow = [matthijs, diederik, martijnA, maurice]

                    console.log("Setting groups: [baku, teheran]")
                    return Expeditie.setGroups([baku, teheran])(kk).then((kk) => {
                        console.log("Setting groups: [baku ++ teheran]")
                        return Expeditie.setGroups([baku.concat(teheran)])(kk)
                    }).then((kk) => {
                        console.log("Setting groups: [moscow]")
                        return Expeditie.setGroups([moscow])(kk)
                    })
                    //     .then((kk) => {
                    //     console.log("Setting groups: [[maurice, diederik], [matthijs, martijnB], [martijnA, robertSl], [robertSan]]")
                    //     return Expeditie.setGroups([[maurice, diederik], [matthijs, martijnB], [martijnA, robertSl], [robertSan]])(kk)
                    // })
                }).then(() => res.send("Expedities Generated"))
            })
        })

        //if(Config.debug) {
            app.get('/reset_database', (req, res) => {
                let promises = []

                promises.push(Tables.Expeditie.remove({}))
                promises.push(Tables.Person.remove({}))
                promises.push(Tables.Route.remove({}))
                promises.push(Tables.RouteEdge.remove({}))
                promises.push(Tables.RouteNode.remove({}))
                promises.push(Tables.Location.remove({}))

                Promise.all(promises).then(() => res.send("Database cleared."))
            })
        //}

        app.get('/route_diagram', (req, res) => {
            Tables.Expeditie.findOne({name: "Kaukasus"}).exec().then((expeditie) => {
                Util.getDocument(expeditie.route, Route.getRouteById).then((route) => {
                    Route.populateCompletely(route).then((route) => {
                        res.render("routeDiagram", {
                            route: route
                        })
                    })
                })
            })
        })
    }
}