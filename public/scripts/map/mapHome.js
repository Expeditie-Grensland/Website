var MapHome;
(function (MapHome) {
    function init() {
        const svgmap = $('#svgmap');
        const expedities = MapHome.getExpeditieCountries();
        let countries = [];
        let amountOfOverlaps = 0;
        for (let expeditie of expedities.expedities) {
            const name = expeditie.name;
            for (let country of expeditie.countries) {
                if (countries.some(x => x == country)) {
                    const id = "diagonalHatch" + amountOfOverlaps.toString();
                    const url = "url(#" + id + ")";
                    console.log(url);
                    const svgCountry = svgmap.find('#' + country);
                    const otherColor = svgCountry.css("fill");
                    svgmap.find('#defs4').append(getOverlapPattern(id, expeditie.color));
                    svgCountry.css({ fill: url });
                    const svgCountryCopy = svgCountry.clone();
                    svgCountryCopy.attr('id', svgCountry.attr('id') + 'copy');
                    svgCountryCopy.css({ fill: otherColor });
                    svgmap.prepend(svgCountryCopy);
                    amountOfOverlaps++;
                }
                else {
                    svgmap.find('#' + country).css({ fill: expeditie.color });
                    countries.push(country);
                }
            }
        }
        svgmap.find('#' + expedities.homeCountry).css({ fill: '#000FFF' });
        //'Refreshing the map because it doesn't accept new patterns when added with jquery. Look into addElementNS TODO
        const map = $('#map');
        const svgHTML = map.html();
        map.html('');
        map.html(svgHTML);
    }
    MapHome.init = init;
    function getExpeditieCountries() {
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
        };
    }
    MapHome.getExpeditieCountries = getExpeditieCountries;
    function getOverlapPattern(id, color) {
        return "<pattern id=\"" + id + "\" patternUnits=\"userSpaceOnUse\" width=\"10\" height=\"10\">\n" +
            "      <path d=\"M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2\" style=\"stroke:" + color + "; stroke-width:4\" />\n" +
            "    </pattern>";
    }
    MapHome.getOverlapPattern = getOverlapPattern;
})(MapHome || (MapHome = {}));
MapHome.init();
