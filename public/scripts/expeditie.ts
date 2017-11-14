declare var MapboxLanguage:any

$(document).ready(() => {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'https://openmaptiles.github.io/klokantech-terrain-gl-style/style-cdn.json',
        center: [5.843570, 52.268337],
        zoom: 6,
    });
    const language = new MapboxLanguage({
        defaultLanguage: 'ru'
    });

    language.setLanguage('https://openmaptiles.github.io/klokantech-terrain-gl-style/style-cdn.json', 'ru')

    console.log(language.supportedLanguages)

    map.addControl(language);


    map.on('load', () => {
        console.log("Map loaded!")

        const language = new MapboxLanguage({
            defaultLanguage: 'ru'
        });

        language.setLanguage(map.getStyle(), 'ru')

        console.log(language.supportedLanguages)

        map.addControl(language);

        console.log(language)
    })
})