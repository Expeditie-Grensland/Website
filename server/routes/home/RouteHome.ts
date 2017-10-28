import * as express from 'express'

export namespace RouteHome {
    export function init(app: express.Express) {
        var expedities = [
            {
                name: "Noordkaap",
                name_short: "noordkaap",
                show_map: true,
                map_url: "/noordkaap",
                movie_url: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/Nordkapp+The+Movie+720p+(Web-Optimized).mp4",
                background_image: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/background.jpg",
                background_position: {
                    x: 75,
                    y: 50
                },
                year: "2015",
                color: "#377eb8",
                countries: [
                    'Germany', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark'
                ]
            },
            {
                name: "Balkan",
                name_short: "balkan",
                show_map: true,
                map_url: "/balkan",
                movie_url: "https://s3-eu-west-1.amazonaws.com/expeditie/balkan/Balkan+the+Movie+(Web-Optimized).mp4",
                background_image: "https://s3-eu-west-1.amazonaws.com/expeditie/balkan/background.jpg",
                background_position: {
                    x: 66,
                    y: 50
                },
                year: "2016",
                color: "#e41a1c",
                countries: [
                    'Germany', 'Austria', 'Slovenia', 'Croatia', 'Bosnia and Herz.', 'Montenegro', 'Albania', 'Kosovo', 'Macedonia', 'Greece', 'Bulgaria', 'Romania', 'Moldova', 'Hungary', 'Slovakia', 'Czech Rep.'
                ]
            },
            {
                name: "Kaukasus",
                name_short: "kaukasus",
                show_map: true,
                map_url: "/kaukasus",
                movie_url: null,
                background_image: "https://s3-eu-west-1.amazonaws.com/expeditie/kaukasus/background.jpg",
                background_position: {
                    x: 40,
                    y: 70
                },
                year: "2017",
                color: "#ff7f00",
                countries: [
                    'Iran', 'Azerbaijan', 'Georgia', 'Armenia', 'Russia', 'Abkhazia', 'Belarus', 'Lithuania', 'Belgium'
                ]
            },
            {
                name: "Grensland",
                name_short: "grensland",
                show_map: false,
                map_url: "/grensland",
                movie_url: null,
                background_image: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/background.jpg",
                background_position: {
                    x: 25,
                    y: 10
                },
                year: "2018",
                color: "#ffd900",
                countries: []
            },
            {
                name: "Alaska",
                name_short: "alaska",
                show_map: false,
                map_url: "/alaska",
                movie_url: null,
                background_image: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/background.jpg",
                background_position: {
                    x: 25,
                    y: 10
                },
                year: "2019",
                color: "#16ff00",
                countries: []
            },
            {
                name: "Op zoek naar -stan",
                name_short: "op_zoek_naar__stan",
                show_map: false,
                map_url: "/stan",
                movie_url: null,
                background_image: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/background.jpg",
                background_position: {
                    x: 25,
                    y: 10
                },
                year: "2020",
                color: "#ff00e2",
                countries: []
            },
            {
                name: "Op zoek naar Atema",
                name_short: "op_zoek_naar_atema",
                show_map: false,
                map_url: "/stan",
                movie_url: null,
                background_image: "https://s3-eu-west-1.amazonaws.com/expeditie/noordkaap/background.jpg",
                background_position: {
                    x: 25,
                    y: 10
                },
                year: "2021",
                color: "#fff9f2",
                countries: []
            }
        ]

        for(let expeditie of expedities) {
            expeditie.countries.push('Netherlands')
        }

        app.get("/", (req, res) => {
            console.log((<any>req).languages)
            res.render("home", {
                expedities: expedities,
                t: (<any>req).t,
                t_ucf: ucFirstWrapper((<any>req).t),
                ucf: ucFirst
            })
        })

        app.get('/overviewMap', (req, res) => {
            res.render("world")
        })
    }

    export function ucFirstWrapper(f: (s: string) => string): (s: string) => string {
        return (str: string) => {
            const translated = f(str)
            return translated.charAt(0).toUpperCase() + translated.slice(1)
        }
    }

    export function ucFirst(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1)
    }
}