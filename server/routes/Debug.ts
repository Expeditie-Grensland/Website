import * as express from "express"
import {Person} from "../database/Person"
import {Expeditie} from "../database/Expeditie"
import {Location} from "../database/Location"
import {LegacyTableData, TableData, Tables} from "../database/Tables"
import {Util} from "../database/Util"
import {Route} from "../database/Route"
import {ColorHelper} from "../helper/ColorHelper"
import PersonDocument = TableData.Person.PersonDocument
import {PlaceHelper} from "../helper/PlaceHelper"

export namespace Debug {

    export async function init(app: express.Express) {

        process.on('unhandledRejection', (reason, p) => {
            console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
            // application specific logging, throwing an error, or other logic here
        });

        app.get("/generate_people", (req, res) => {
            let users = ["Maurice Meedendorp", "Ronald Kremer", "Diederik Blaauw", "Matthijs Nuus", "Martijn Atema", "Martijn Bakker", "Robert Sandee", "Robert Slomp"]
            let promises = []

            for(let name of users) {
                promises.push(Person.createPerson({name: name}))
            }

            Promise.all(promises).then(() => res.send('People created')).catch(err => res.send("Error Occurred: " + err))
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
            let noordkaapPersonPromise1 = Promise.all([maurice, ronald, diederik, martijnA, robertSan])
            let noordkaapPersonPromise2 = martijnB
            let balkanPersonPromise = Promise.all([maurice, ronald, diederik, martijnA, robertSan, matthijs, robertSl])
            let kaukasusPersonPromise1 = Promise.all([maurice, ronald, martijnA])
            let kaukasusPersonPromise2 = Promise.all([diederik, matthijs])

            const noordkaapPromise = Promise.all([noordkaapPersonPromise1, noordkaapPersonPromise2]).then(([group, martijnB]) => {
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
                    participants: Util.getObjectIDs(group.concat(martijnB)),
                    countries: [
                        "Netherlands", "Germany", "Poland", "Lithuania", "Latvia", "Estonia", "Finland", "Sweden", "Norway", "Denmark",
                    ],
                })//.then(Expeditie.setGroups([group.concat(martijnB)])).then(Expeditie.setGroups([group, [martijnB]]))
            }).then((expeditie) => {
                console.log("Noordkaap expeditie successfully created!")
                return expeditie
            }).catch(err => Promise.reject("Something went wrong during the creation of the Noordkaap Expeditie: " + err))

            const balkanPromise = balkanPersonPromise.then((persons) => {
                console.log("Balkan people successfully retrieved!")
                return Expeditie.createExpeditie({
                    sequenceNumber: 1,
                    name: "Balkan",
                    nameShort: "balkan",
                    subtitle: "2016",
                    showMap: true,
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
                    participants: Util.getObjectIDs(persons),
                    countries: [
                        "Netherlands", "Germany", "Austria", "Slovenia", "Croatia", "Bosnia and Herz.", "Montenegro", "Albania", "Kosovo", "Macedonia", "Greece", "Bulgaria", "Romania", "Moldova", "Hungary", "Slovakia", "Czech Rep.",
                    ],
                })//.then(Expeditie.setGroups([persons]))
            }).then((expeditie) => {
                console.log("Balkan expeditie successfully created!")
                return expeditie
            }).then(Expeditie.setFinished(true))
                .catch(err => Promise.reject("Something went wrong during the creation of the Balkan Expeditie: " + err))

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
                    participants: Util.getObjectIDs(teheran).concat(Util.getObjectIDs(baku)),
                    countries: [
                        "Netherlands", "Iran", "Azerbaijan", "Georgia", "Armenia", "Russia", "Abkhazia", "Belarus", "Lithuania", "Belgium",
                    ],
                }).then(Expeditie.setFinished(true))
                    .catch(err => Promise.reject("Something went wrong during the creation of the Kaukasus Expeditie: " + err))
            })

            return Promise.all([noordkaapPromise, balkanPromise, kaukasusPromise]).then(([nk, bk, kk]) => {
                /**return allPeoplePromise.then(([maurice, ronald, diederik, matthijs, martijnA, martijnB, robertSan, robertSl]) => {
                    console.log("Setting Kaukasus groups..")

                    let baku: TableData.PersonOrID[] = [ronald, martijnA, maurice]
                    let teheran = [matthijs, diederik]
                    let moscow = [matthijs, diederik, martijnA, maurice]

                    console.log("Setting groups: [baku, teheran]")
                    return Expeditie.setGroups([baku, teheran])(kk).then((kk) => {
                        console.log("Setting groups: [baku ++ teheran]")
                        return Expeditie.setGroups([baku.concat(teheran)])(kk)
                    }).then((kk) => {
                        console.log("Setting groups: [moscow, [ronald]]")
                        return Expeditie.setGroups([moscow, [ronald]])(kk)
                    })
                })*/
            }).then(() => res.send("Expedities Generated")).catch(err => {
                res.send("Something went wrong during the setting of the Kaukasus Expeditie groups: " + err)
                console.log(err)
            })
        })

        app.get('/reset_database', (req, res) => {
            let promises = []

            promises.push(Tables.Expeditie.remove({}))
            promises.push(Tables.Person.remove({}))
            promises.push(Tables.Route.remove({}))
            promises.push(Tables.RouteNode.remove({}))
            promises.push(Tables.Location.remove({}))
            promises.push(Tables.Place.remove({}))
            promises.push(ColorHelper.resetCache())
            promises.push(PlaceHelper.resetCache())

            Promise.all(promises).then(() => res.send("Database cleared.")).catch(err => {
                res.send("Error Occurred: " + err)
                console.log(err)
            })
        })

        app.get('/route_diagram', (req, res) => {
            Tables.Expeditie.findOne({name: "Kaukasus"}).exec().then((expeditie) => {
                Util.getDocument(expeditie.route, Route.getRouteById).then((route) => {
                    Route.getNodes(route).then((nodes) => {
                        return Promise.all(nodes.map(node => Route.populateNodePersons(node))).then(nodes => {
                            res.render("debug/routeDiagram", {
                                route: route,
                                nodes: nodes
                            })
                        })
                    })
                })
            }).catch(err => {
                res.send("Error Occurred: " + err)
                console.log(err)
            })
        })

        app.get('/import_kaukasus', (req, res) => {
            res.render('debug/importKaukasus')
        })

        app.get('/import_balkan', (req, res) => {
            res.render('debug/importBalkan')
        })

        app.post('/import_kaukasus/data', (req, res) => {
            const maurice = Person.getPerson("Maurice Meedendorp")
            const ronald = Person.getPerson("Ronald Kremer")
            const diederik = Person.getPerson("Diederik Blaauw")
            const matthijs = Person.getPerson("Matthijs Nuus")
            const martijnA = Person.getPerson("Martijn Atema")
            const kaukasus = Expeditie.getExpeditieByName("Kaukasus")

            const data: LegacyTableData.Kaukasus.ExportJSON = req.body

            Promise.all([matthijs, diederik, maurice, ronald, martijnA])
                .then(([matthijs, diederik, maurice, ronald, martijnA]) => {
                    const diederikData = Location.removePingData(data.diederik.route, diederik).sort((l1, l2) => l1.timestamp - l2.timestamp).slice(0,-12) //Last values is bogus. Forgot to turn tracking off.
                    const mauriceData = Location.removePingData(data.maurice.route, maurice).sort((l1, l2) => l1.timestamp - l2.timestamp)
                    const ronaldData = Location.removePingData(data.ronald.route, ronald).sort((l1, l2) => l1.timestamp - l2.timestamp)

                    const mauriceData1 = mauriceData.filter(location =>
                            location.timestamp <= diederikData[diederikData.length-1].timestamp
                        ) //Baku
                    const mauriceData2 = mauriceData.filter(location =>
                            location.timestamp > diederikData[diederikData.length-1].timestamp &&
                            location.timestamp <= ronaldData[0].timestamp
                        ) //Baku - Moscow
                    const mauriceData3 = mauriceData.filter(location =>
                            location.timestamp > ronaldData[0].timestamp
                        ) //Moscow

                    kaukasus.catch(err => {
                        res.send("Kaukasus not found. Are expedities initialized? Error: " + err)
                        console.log(err)
                    })

                    return kaukasus
                        .then(Expeditie.setFinished(false))
                        .then(Expeditie.setGroups([[matthijs, diederik], [maurice, ronald, martijnA]]))
                        .then(Expeditie.addLocations(diederikData))
                        .then(Expeditie.addLocations(mauriceData1))
                        .then(Expeditie.setGroups([[matthijs, diederik, maurice, ronald, martijnA]]))
                        .then(Expeditie.addLocations(mauriceData2))
                        .then(Expeditie.setGroups([[matthijs, diederik, maurice, martijnA], [ronald]]))
                        .then(Expeditie.addLocations(ronaldData))
                        .then(Expeditie.addLocations(mauriceData3))
                        .then(Expeditie.setFinished(true))

                        .then(() => res.send("File received")).then(() => console.log("Done"))
                        .then((data) => {
                            console.log(data)
                        })
                }).catch(err => {
                    res.send("Persons not found. Are people initialized? Error: " + err)
                    console.log(err)
                })
        })

        app.post('/import_balkan/data', async (req, res) => {
            const maurice = await Person.getPerson("Maurice Meedendorp")
            const ronald = await Person.getPerson("Ronald Kremer")
            const diederik = await Person.getPerson("Diederik Blaauw")
            const matthijs = await Person.getPerson("Matthijs Nuus")
            const martijnA = await Person.getPerson("Martijn Atema")
            const robertSl = await Person.getPerson("Robert Slomp")
            const robertSan = await Person.getPerson("Robert Sandee")
            const balkan = Expeditie.getExpeditieByName("Balkan")

            const data: LegacyTableData.Balkan.ExportJSON = req.body

            console.log("reversing locations..")

            const legacyLocations = data.locations.reverse()
            const locations: TableData.Location.Location[] = []

            console.log("Transforming locations to non-legacy locations..")

            for(let location of legacyLocations) {
                locations.push(Location.fromBalkanLegacy(location, maurice))
            }

            console.log("Location count: " + locations.length)

            balkan.catch(err => {
                res.send("Balkan not found. Are expedities initialized? Error: " + err)
                console.log(err)
            })

            balkan.then(Expeditie.setFinished(false))
                .then(Expeditie.setGroups([[maurice, ronald, diederik, matthijs, martijnA, robertSl, robertSan]]))
                .then(Expeditie.addLocations(locations))
                .then(Expeditie.setFinished(true))

                .then(() => res.send("File received"))
                .then(() => console.log("Done"))
                .then(() => Tables.Place.find({}).exec())
                .then(places => console.log("created x amount of places: " + places.length))
                .then((data) => {
                    console.log(data)
                })
        })

        app.get('/uptime', (req, res) => {
            const sprintf = require('sprintf-js').sprintf

            res.send(sprintf("The server has been running for: %d seconds.", process.uptime()))
        })
    }
}