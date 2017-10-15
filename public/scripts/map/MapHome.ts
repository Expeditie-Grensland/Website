namespace MapHome {
    export function init() {
        const expeditieCountries = getExpeditieCountries()

        expeditieCountries.expedities.forEach((expeditie) => {
            expeditie.countries.forEach((country) => {
                $('#' + countryNameToCSSID(country)).addClass(countryNameToCSSID(expeditie.name))
            })
        })

        expeditieCountries.expedities.forEach((expeditie) => {
            const expeditieClassSelector = $('.' + countryNameToCSSID(expeditie.name))

            expeditieClassSelector.hover(function (event) {
                expeditieClassSelector.each((i, element) => {
                    popOut(<SVGPathElement><any>element)
                })
            }, function (event) {
                expeditieClassSelector.each((index, element) => {
                    resetTransform(element)
                })
            })
        })
    }

    export function countryNameToCSSID(name: string): string {
        return name.replace(/ /gi, "_").replace(/\./gi, "\\.") //Spaces are not allowed in ids and escape . characters in css selector
    }

    export function popOut(element: SVGPathElement) {
        console.log("In " + $(element).attr('class'))

        $(element).addClass('animate');
    }

    export function resetTransform(element: HTMLElement) {
        console.log(" " + $(element).attr('class'))

        $(element).removeClass('animate')
    }

    export function getExpeditieCountries() {
        //TODO method stub

        return {
            homeCountry: 'Netherlands',
            expedities: [
                {
                    name: 'Noordkaap',
                    countries: ['Germany', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark'],
                    color: '#3482ff'
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
        }
    }
}

MapHome.init()