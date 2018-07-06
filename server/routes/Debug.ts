import * as express from "express"
import {Person} from "../database/Person"
import {Expeditie} from "../database/Expeditie"
import {Location} from "../database/Location"
import {LegacyTableData, TableData, Tables} from "../database/Tables"
import {Util} from "../database/Util"
import {Route} from "../database/Route"
import {ColorHelper} from "../helper/ColorHelper"
import {PlaceHelper} from "../helper/PlaceHelper"
import bodyParser = require("body-parser")

export namespace Debug {

    export async function init(app: express.Express) {

        process.on('unhandledRejection', (reason, p) => {
            console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
            // application specific logging, throwing an error, or other logic here
        });

        app.get("/generate_people", (req, res) => {
            let users = ["Maurice Meedendorp", "Ronald Kremer", "Diederik Blaauw", "Matthijs Nuus", "Martijn Atema", "Martijn Bakker", "Robert Sandee", "Robert Slomp", "Roy Steneker"]
            let promises = []

            for(let name of users) {
                promises.push(Person.createPerson({name: name}))
            }

            Promise.all(promises).then(() => res.send('People created')).catch(err => res.send("Error Occurred: " + err))
        })

        app.get("/generate_expedities", async (req, res) => {
            try {
                let maurice = await Person.getPerson("Maurice Meedendorp")
                let ronald = await Person.getPerson("Ronald Kremer")
                let diederik = await Person.getPerson("Diederik Blaauw")
                let matthijs = await Person.getPerson("Matthijs Nuus")
                let martijnA = await Person.getPerson("Martijn Atema")
                let martijnB = await Person.getPerson("Martijn Bakker")
                let robertSan = await Person.getPerson("Robert Sandee")
                let robertSl = await Person.getPerson("Robert Slomp")
                let roy = await Person.getPerson("Roy Steneker")

                const noordkaapPromise = Expeditie.createExpeditie({
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
                    participants: Util.getObjectIDs([maurice, ronald, diederik, martijnA, robertSan, martijnB]),
                    countries: [
                        "Netherlands", "Germany", "Poland", "Lithuania", "Latvia", "Estonia", "Finland", "Sweden", "Norway", "Denmark",
                    ],
                }).then((expeditie) => {
                        console.log("Noordkaap expeditie successfully created!")
                        return expeditie
                    }).then(Expeditie.setFinished(true))
                    .catch(err => Promise.reject("Something went wrong during the creation of the Noordkaap Expeditie: " + err))

                const balkanPromise = Expeditie.createExpeditie({
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
                    participants: Util.getObjectIDs([maurice, diederik, ronald, matthijs, robertSl, robertSan, martijnA]),
                    countries: [
                        "Netherlands", "Germany", "Austria", "Slovenia", "Croatia", "Bosnia and Herz.", "Montenegro", "Albania", "Kosovo", "Macedonia", "Greece", "Bulgaria", "Romania", "Moldova", "Hungary", "Slovakia", "Czech Rep.",
                    ],
                }).then((expeditie) => {
                    console.log("Balkan expeditie successfully created!")
                    return expeditie
                }).then(Expeditie.setFinished(true))
                    .catch(err => Promise.reject("Something went wrong during the creation of the Balkan Expeditie: " + err))

                const kaukasusPromise = Expeditie.createExpeditie({
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
                    participants: Util.getObjectIDs([maurice, diederik, ronald, matthijs, martijnA]),
                    countries: [
                        "Netherlands", "Iran", "Azerbaijan", "Georgia", "Armenia", "Russia", "Abkhazia", "Belarus", "Lithuania", "Belgium",
                    ],
                }).then((expeditie) => {
                    console.log("Kaukasus expeditie successfully created!")
                    return expeditie
                }).then(Expeditie.setFinished(true))
                    .catch(err => Promise.reject("Something went wrong during the creation of the Kaukasus Expeditie: " + err))

                const japanPromise = Expeditie.createExpeditie({
                    sequenceNumber: 3,
                    name: "Japan",
                    nameShort: "japan",
                    subtitle: "Winter 2017",
                    showMap: false,
                    color: "#EF3340", //Japan red
                    movieUrl: null,
                    movieCoverUrl: null,
                    background: {
                        imageUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/japan/background.jpg",
                        position: {
                            x: 45,
                            y: 50,
                        },
                    },
                    participants: Util.getObjectIDs([maurice, martijnA, diederik, ronald, matthijs, martijnB]),
                    countries: [
                        "Netherlands", "Japan"
                    ],
                }).then((expeditie) => {
                    console.log("Japan expeditie successfully created!")
                    return expeditie
                }).then(Expeditie.setFinished(true))
                    .catch(err => Promise.reject("Something went wrong during the creation of the Japan Expeditie: " + err))

                const moiPromise = Expeditie.createExpeditie({
                    sequenceNumber: 4,
                    name: "Holte & Moi",
                    nameShort: "moi",
                    subtitle: "Lente 2018",
                    showMap: true,
                    color: "#377eb8",
                    movieUrl: null,
                    movieCoverUrl: null,
                    background: {
                        imageUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/moi/background.jpg",
                        position: {
                            x: 61,
                            y: 50,
                        },
                    },
                    participants: Util.getObjectIDs([maurice, martijnA, diederik, roy, matthijs, martijnB]),
                    countries: [
                        "Netherlands", "Germany", "Sweden", "Norway", "Denmark"
                    ],
                }).then((expeditie) => {
                    console.log("Moi expeditie successfully created!")
                    return expeditie
                }).then(Expeditie.setFinished(true))
                    .catch(err => Promise.reject("Something went wrong during the creation of the Moi Expeditie: " + err))

                const stanPromise = Expeditie.createExpeditie({
                    sequenceNumber: 5,
                    name: "Op zoek naar -stan",
                    nameShort: "stan",
                    subtitle: "2018",
                    showMap: false,
                    color: "#00afca", //Kazachstan blue
                    movieUrl: null,
                    movieCoverUrl: null,
                    background: {
                        imageUrl: "https://s3-eu-west-1.amazonaws.com/expeditie/stan/background.jpg",
                        position: {
                            x: 55,
                            y: 50,
                        },
                    },
                    participants: Util.getObjectIDs([maurice, martijnA, diederik, ronald, matthijs, martijnB]),
                    countries: [
                        "Netherlands", "Kazakhstan", "Kyrgyzstan"
                    ],
                }).then((expeditie) => {
                    console.log("Op Zoek Naar -stan expeditie successfully created!")
                    return expeditie
                }).then(Expeditie.setFinished(true))
                    .catch(err => Promise.reject("Something went wrong during the creation of the Op Zoek Naar -stan  Expeditie: " + err))

                await noordkaapPromise
                await balkanPromise
                await kaukasusPromise
                await japanPromise
                await moiPromise
                await stanPromise

                res.send("Expedities Generated!")
            } catch(err) {
                res.send("Something went wrong..: " + err)
                console.log(err)
            }
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

        app.get('/import_moi', (req, res) => {
            res.render('debug/importMoi')
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
                    const diederikData = Location.removePingData(data.diederik.route, diederik).sort((l1, l2) => l1.timestamp - l2.timestamp).slice(0,-12) //Last values are bogus. Forgot to turn tracking off.
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

        app.use('/import_moi/data', bodyParser.text({type: 'application/gpx', limit: '80MB'}));
        app.post('/import_moi/data', async (req, res) => {
            const maurice = await Person.getPerson("Maurice Meedendorp")
            const roy = await Person.getPerson("Roy Steneker")
            const diederik = await Person.getPerson("Diederik Blaauw")
            const matthijs = await Person.getPerson("Matthijs Nuus")
            const martijnA = await Person.getPerson("Martijn Atema")
            const martijnB = await Person.getPerson("Martijn Bakker")
            const moi = Expeditie.getExpeditieByName("Holte & Moi")

            const data: any = req.body

            moi.catch(err => {

                res.send("Moi not found. Are expedities initialized? Error: " + err)
                console.log(err)
            })

            const locations = await Location.fromGPX(data, maurice)

            moi.then(Expeditie.setFinished(false))
                .then(Expeditie.setGroups([[maurice, diederik, matthijs, martijnA, martijnB, roy]]))
                .then(Expeditie.addLocations(locations))
                .then(Expeditie.setFinished(true))

                .then(() => res.send("File received"))
                .then(() => console.log("Done"))
                //.then(() => Tables.Place.find({}).exec())
                //.then(places => console.log("created x amount of places: " + places.length))
                // .then((data) => {
                //     console.log(data)
                // })
        })

        app.get('/uptime', (req, res) => {
            const sprintf = require('sprintf-js').sprintf

            res.send(sprintf("The server has been running for: %d seconds.", process.uptime()))
        })
    }
}
