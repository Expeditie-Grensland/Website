import * as express from 'express'
import {DiagonalHatch} from "./DiagonalHatch";
import {List} from "../../structures/List";
import {None, Some} from "tsoption";

export namespace RouteHome {
    export function init(app: express.Express) {
        //TODO: make this update if a new expeditie is added.
        const expeditieCountries = getExpeditieCountries()

        const coloredCountries: Map<string, List<string>> = new Map() //Map<country, List<color>>

        const homeCountryID = countryNameToCSSID(expeditieCountries.homeCountry)

        coloredCountries.set(homeCountryID, List.mk('#782100'))

        for (let expeditie of expeditieCountries.expedities) {
            for (let country of expeditie.countries) {
                const countryID = countryNameToCSSID(country)

                let colorList = List.mk(expeditie.color)

                if (coloredCountries.has(countryID)) {
                    colorList = coloredCountries.get(countryID).add(expeditie.color)
                }

                coloredCountries.set(countryID, colorList)
            }
        }

        let cssString: string = ""
        let patterns: List<DiagonalHatch> = List.mk()

        coloredCountries.forEach((colorList, country) => {
            let fillValue = colorList.get(0)

            if(colorList.length() > 1) {
                const hatch = new DiagonalHatch(colorList.get(0), colorList.get(1), colorList.get(2) == null ? None() : Some(colorList.get(2)))
                patterns = patterns.add(hatch)
                fillValue = `url(#${hatch.getID()})`
            }

            cssString += `#${country} {fill: ${fillValue}; stroke: #fff}\n`
        })

        app.get("/", (req, res) => res.render("home", {
            cache: true,
            patterns: patterns.foldLeft("", (str, pattern) => str + pattern.toSVG()),
            svgCSS: cssString
        }))
    }

    export function countryNameToCSSID(name: string): string {
        return name.replace(/ /gi, "_").replace(/\./gi, "\\.") //Spaces are not allowed in ids and escape . characters in css selector
    }

    export function getExpeditieCountries() {
        //TODO method stub

        return {
            homeCountry: 'Netherlands',
            expedities: [
                {
                    name:      'Noordkaap',
                    countries: ['Germany', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark'],
                    color:     '#377eb8' //Suomi blue
                },
                {
                    name: 'Balkan',
                    countries: ['Germany', 'Austria', 'Slovenia', 'Croatia', 'Bosnia and Herz.', 'Montenegro', 'Albania', 'Kosovo', 'Macedonia', 'Greece', 'Bulgaria', 'Romania', 'Moldova', 'Hungary', 'Slovakia', 'Czech Rep.'],
                    color: '#e41a1c'
                },
                {
                    name: 'Kaukasus',
                    countries: ['Iran', 'Azerbaijan', 'Georgia', 'Armenia', 'Russia', 'Abkhazia', 'Belarus', 'Lithuania', 'Belgium'],
                    color: '#ff7f00'
                }
            ]
        }
    }
}