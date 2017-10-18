import * as express from 'express'

export namespace RouteHome {
    export function init(app: express.Express) {
        var expedities = [
            {
                name: "Noordkaap", //TODO: localized name
                map_url: "/noordkaap",
                movie_url: "/noordkaap/movie",
                map_thumbnail: "/noordkaap/thumbnail/map",
                movie_thumbnail: "/noordkaap/thumbnail/movie",
                background_image: "https://mmeedendorp.stackstorage.com/public-share/jCrikHWCbQL1atS/preview?path=/&mode=thumbnail&size=large",
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
                background_image: "https://mmeedendorp.stackstorage.com/public-share/CFcAcj6D8cBDpXy/preview?path=/&mode=thumbnail&size=large",
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