import * as express from "express"
import {TableData, Tables} from "../database/Tables"

export namespace Debug {

    import PersonDocument = TableData.Person.PersonDocument

    export function init(app: express.Express) {
        /*let maurice = TableData.Person.person("Maurice")
        let diederik = TableData.Person.person("Diederik")
        let matthijs = TableData.Person.person("Matthijs")
        let ronald = TableData.Person.person("Ronald")
        let robertSandee = TableData.Person.person("Robert Sandee")
        let robertSlomp = TableData.Person.person("Robert Slomp")

        const peoplePromise = Tables.Person.create(maurice, diederik, matthijs, ronald, robertSandee, robertSlomp)

        peoplePromise.then((result: PersonDocument) => {
            console.log(result)
        })*/

/**
        let expedities: TableData.Expeditie.Expeditie[] = [
            {
                sequence_number:     0,
                name:                "Noordkaap",
                name_short:          "noordkaap",
                show_map:            true,
                map_url:             "/noordkaap",
                movie_url:           "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/Nordkapp+The+Movie+720p+(Web-Optimized).mp4",
                movie_cover_url:           "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/cover.jpg",
                background: {
                    image_url: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/background.jpg",
                    position: {
                        x: 75,
                        y: 50
                    }
                },
                subtitle:                "2015",
                color:               "#377eb8",
                participants:        [
                    TableData.Person.person("Maurice"),
                    TableData.Person.person("Atema"),
                    TableData.Person.person("Diederik"),
                    TableData.Person.person("Ronald"),
                    TableData.Person.person("Robert"),
                ],
                route: null,
                countries:           TableData.Country.countries([
                    'Germany', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark'
                ])
            },
            {
                sequence_number:     1,
                name:                "Balkan",
                name_short:          "balkan",
                show_map:            true,
                map_url:             "/balkan",
                movie_url:           "https://s3-eu-west-1.amazonaws.com/expeditie/balkan/Balkan+the+Movie+(Web-Optimized).mp4",
                movie_cover_url:           "https://s3-eu-west-1.amazonaws.com/expeditie/balkan/cover.jpg",
                background: {
                    image_url: "https://s3-eu-west-1.amazonaws.com/expeditie/balkan/background.jpg",
                    position: {
                        x: 75,
                        y: 50
                    }
                },
                subtitle:                "2016",
                color:               "#e41a1c",
                participants:        [
                    TableData.Person.person("Maurice"),
                    TableData.Person.person("Atema"),
                    TableData.Person.person("Diederik"),
                    TableData.Person.person("Ronald"),
                    TableData.Person.person("Robert Sandee"),
                    TableData.Person.person("Robert Slomp"),
                    TableData.Person.person("Matthijs"),
                ],
                route: null,
                countries:           TableData.Country.countries([
                    'Germany', 'Austria', 'Slovenia', 'Croatia', 'Bosnia and Herz.', 'Montenegro', 'Albania', 'Kosovo', 'Macedonia', 'Greece', 'Bulgaria', 'Romania', 'Moldova', 'Hungary', 'Slovakia', 'Czech Rep.'
                ])
            },
            {
                sequence_number:     2,
                name:                "Kaukasus",
                name_short:          "kaukasus",
                show_map:            true,
                map_url:             "/kaukasus",
                movie_url:           null,
                background: {
                    image_url: "https://s3-eu-west-1.amazonaws.com/expeditie/kaukasus/background.jpg",
                    position: {
                        x: 75,
                        y: 50
                    }
                },
                subtitle:                "2017",
                color:               "#ff7f00",
                participants:        [
                    TableData.Person.person("Maurice"),
                    TableData.Person.person("Atema"),
                    TableData.Person.person("Diederik"),
                    TableData.Person.person("Ronald"),
                    TableData.Person.person("Matthijs"),
                ],
                route: null,
                countries:           TableData.Country.countries([
                    'Iran', 'Azerbaijan', 'Georgia', 'Armenia', 'Russia', 'Abkhazia', 'Belarus', 'Lithuania', 'Belgium'
                ])
            }
        ]**/

        app.get('/generate_users', (req, res) => {
            res.send('Hello there!')
        })

        app.get('/generate_countries', (req, res) => {
            res.send('Hello there!')
        })

        app.get('/generate_expedities', (req, res) => {
            res.send('Hello there!')
        })
    }
}