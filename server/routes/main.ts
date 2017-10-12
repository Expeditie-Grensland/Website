import * as express from 'express'

export namespace Main {
    export function init(app: express.Express) {
        const patterns = '<pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="10" height="10"> <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" style="stroke:black; stroke-width:4" /> </pattern>'

        app.get("/", (req, res) => res.render("home", {
            filename: "homepage.cache",
            cache: true,
            patterns: patterns
        }))
    }

    export function getExpeditieCountries() {
        //TODO method stub
        //TODO should be in proper language

        return {
            homeCountry: 'NL',
            expedities: [
                {
                    name: 'Noordkaap',
                    countries: ['DE', 'PL', 'LT', 'LV', 'EE', 'FI', 'SE', 'NO', 'DK'],
                    color: '#002ea2' //Suomi blue
                },
                {
                    name: 'Balkan',
                    countries: ['DE', 'AT', 'SI', 'HR', 'BA', 'ME', 'AL', 'XK', 'MK', 'GR', 'BG', 'RO', 'MD', 'HU', 'SK', 'CZ'],
                    color: '#e41e20'
                },
                {
                    name: 'Kaukasus',
                    countries: ['IR', 'AZ', 'GE', 'AM', 'RU', 'BY', 'LT', 'BE'],
                    color: '#FF7F00'
                }
            ]
        }
    }

    export function getOverlapPattern(id: string, color: string) {
        return "<pattern id=\"" + id + "\" patternUnits=\"userSpaceOnUse\" width=\"10\" height=\"10\">\n" +
            "      <path d=\"M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2\" style=\"stroke:" + color + "; stroke-width:4\" />\n" +
            "    </pattern>"
    }
}