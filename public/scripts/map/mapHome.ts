namespace MapHome {
    export function init() {

        const svgmap = $('#svgmap')

        const expedities  = MapHome.getExpeditieCountries();

        let countries: string[] = []

        for(let expeditie of expedities.expedities) {
            const name = expeditie.name;

            for(let country of expeditie.countries) {
                if(countries.some(x => x == country)) {
                    svgmap.find('#' + country).css({fill: 'url(#diagonalHatch)'})
                } else {
                    svgmap.find('#' + country).css({fill: expeditie.color})
                    countries.push(country)
                }
            }
        }

        svgmap.find('#'+ expedities.homeCountry).css({fill: '#000FFF'})
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
}
MapHome.init()