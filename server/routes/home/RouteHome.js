"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DiagonalHatch_1 = require("./DiagonalHatch");
const List_1 = require("../../structures/List");
const tsoption_1 = require("tsoption");
var RouteHome;
(function (RouteHome) {
    function init(app) {
        //TODO: make this update if a new expeditie is added.
        const expeditieCountries = getExpeditieCountries();
        const coloredCountries = new Map(); //Map<country, List<color>>
        let homeCountry = expeditieCountries.homeCountry;
        homeCountry = homeCountry.replace(/ /gi, "_"); //Spaces are not allowed in ids
        homeCountry = homeCountry.replace(/\./gi, "\\."); //Escape . characters in css selector
        coloredCountries.set(homeCountry, List_1.List.mk('#782100'));
        for (let expeditie of expeditieCountries.expedities) {
            for (let country of expeditie.countries) {
                country = country.replace(/ /gi, "_"); //Spaces are not allowed in ids
                country = country.replace(/\./gi, "\\."); //Escape . characters in css selector
                let colorList = List_1.List.mk(expeditie.color);
                if (coloredCountries.has(country)) {
                    colorList = coloredCountries.get(country).add(expeditie.color);
                }
                coloredCountries.set(country, colorList);
            }
        }
        let cssString = "";
        let patterns = List_1.List.mk();
        coloredCountries.forEach((colorList, country) => {
            if (colorList.length() == 1)
                cssString += `#${country} {fill: ${colorList.get(0)}}\n`;
            else if (colorList.length() == 2) {
                const hatch = new DiagonalHatch_1.DiagonalHatch(colorList.get(0), colorList.get(1), tsoption_1.None());
                patterns = patterns.add(hatch);
                cssString += `#${country} {fill: url(#${hatch.getID()})}\n`;
            }
            else if (colorList.length() == 3) {
                const hatch = new DiagonalHatch_1.DiagonalHatch(colorList.get(0), colorList.get(1), tsoption_1.Some(colorList.get(2)));
                patterns = patterns.add(hatch);
                cssString += `#${country} {fill: url(#${hatch.getID()})}\n`;
            }
        });
        app.get("/", (req, res) => res.render("home", {
            cache: true,
            patterns: patterns.foldLeft("", (str, pattern) => str + pattern.toSVG()),
            svgCSS: cssString
        }));
    }
    RouteHome.init = init;
    function getExpeditieCountries() {
        //TODO method stub
        return {
            homeCountry: 'Netherlands',
            expedities: [
                {
                    name: 'Noordkaap',
                    countries: ['Germany', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark'],
                    color: '#002ea2' //Suomi blue
                },
                {
                    name: 'Balkan',
                    countries: ['Germany', 'Austria', 'Slovenia', 'Croatia', 'Bosnia and Herz.', 'Montenegro', 'Albania', 'Kosovo', 'Macedonia', 'Greece', 'Bulgaria', 'Romania', 'Moldova', 'Hungary', 'Slovakia', 'Czech Rep.'],
                    color: '#e41e20'
                },
                {
                    name: 'Kaukasus',
                    countries: ['Iran', 'Azerbaijan', 'Georgia', 'Armenia', 'Russia', 'Abkhazia', 'Belarus', 'Lithuania', 'Belgium'],
                    color: '#FF7F00'
                }
            ]
        };
    }
    RouteHome.getExpeditieCountries = getExpeditieCountries;
})(RouteHome = exports.RouteHome || (exports.RouteHome = {}));
