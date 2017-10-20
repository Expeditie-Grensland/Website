import * as express from 'express'

export namespace RouteHome {
    export function init(app: express.Express) {
        var expedities = [
            {
                name: "Noordkaap",
                map_url: "/noordkaap",
                movie_url: "/noordkaap/movie",
                map_thumbnail: "/noordkaap/thumbnail/map",
                movie_thumbnail: "/noordkaap/thumbnail/movie",
                background_image: "/img/noordkaap_vaag10.jpg",
                background_position: {
                    x: 75,
                    y: 50
                },
                year: "2015",
                color: "#377eb8"
            },
            {
                name: "Balkan",
                map_url: "/balkan",
                movie_url: "/balkan/movie",
                map_thumbnail: "/noordkaap/thumbnail/map",
                movie_thumbnail: "/noordkaap/thumbnail/movie",
                background_image: "/img/balkan_vaag10.jpg",
                background_position: {
                    x: 66,
                    y: 50
                },
                year: "2016",
                color: "#e41a1c"
            },
            {
                name: "Kaukasus",
                map_url: "/kaukasus",
                movie_url: "/kaukasus/movie",
                map_thumbnail: "/noordkaap/thumbnail/map",
                movie_thumbnail: "/noordkaap/thumbnail/movie",
                //background_image: "https://mmeedendorp.stackstorage.com/public-share/xwg0iHwfu7tRaJA/preview?path=/&mode=thumbnail&size=medium",
                background_image: "",
                background_position: {
                    x: 25,
                    y: 10
                },
                year: "2017",
                color: "#ff7f00"
            },
            {
                name: "Grensland",
                map_url: "/grensland",
                movie_url:           "/grensland/movie",
                map_thumbnail:       "/grensland/thumbnail/map",
                movie_thumbnail:     "/grensland/thumbnail/movie",
                //background_image: "https://mmeedendorp.stackstorage.com/public-share/xwg0iHwfu7tRaJA/preview?path=/&mode=thumbnail&size=medium",
                background_image:    "",
                background_position: {
                    x: 25,
                    y: 10
                },
                year:                "2018",
                color:               "#ffd900"
            },
            {
                name: "Alaska",
                map_url: "/alaska",
                movie_url:           "/alaska/movie",
                map_thumbnail:       "/alaska/thumbnail/map",
                movie_thumbnail:     "/alaska/thumbnail/movie",
                //background_image: "https://mmeedendorp.stackstorage.com/public-share/xwg0iHwfu7tRaJA/preview?path=/&mode=thumbnail&size=medium",
                background_image:    "",
                background_position: {
                    x: 25,
                    y: 10
                },
                year:                "2019",
                color:               "#16ff00"
            },
            {
                name: "Op zoek naar -stan",
                map_url: "/stan",
                movie_url:           "/stan/movie",
                map_thumbnail:       "/stan/thumbnail/map",
                movie_thumbnail:     "/stan/thumbnail/movie",
                //background_image: "https://mmeedendorp.stackstorage.com/public-share/xwg0iHwfu7tRaJA/preview?path=/&mode=thumbnail&size=medium",
                background_image:    "",
                background_position: {
                    x: 25,
                    y: 10
                },
                year:                "2020",
                color:               "#ff00e2"
            },
            {
                name: "Op zoek naar Atema",
                map_url: "/stan",
                movie_url:           "/stan/movie",
                map_thumbnail:       "/stan/thumbnail/map",
                movie_thumbnail:     "/stan/thumbnail/movie",
                //background_image: "https://mmeedendorp.stackstorage.com/public-share/xwg0iHwfu7tRaJA/preview?path=/&mode=thumbnail&size=medium",
                background_image:    "",
                background_position: {
                    x: 25,
                    y: 10
                },
                year:                "2021",
                color:               "#fff9f2"
            }
        ]


        app.get("/", (req, res) => {
            console.log((<any>req).languages)
            res.render("home", {
                expedities: expedities,
                t: (<any>req).t,
                t_ucf: ucFirstWrapper((<any>req).t),
                ucf: ucFirst
            })
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