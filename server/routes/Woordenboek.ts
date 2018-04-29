import * as express from "express"

export namespace Woordenboek {

    export type DictionaryEntry = {
        word: string,
        definitions: string[]
    }

    /**
     *    */

    export const dictionary: DictionaryEntry[] = [
        {
            word:       'Atebarf',
            definitions: ["Al rijdende in een voertuig uw maaginhoud legen door het raam. Vernoemd naar R. M. Atema tijdens de examenuitreiking van R. Slomp."]
        },
        {
            word:       'Atekouk',
            definitions: ["Pannekoeken (Gronings: Pankouk) op primitive wijze gemaakt door R. M. Atema. Verder geen specificaties bekend."]
        },
        {
            word:       "Bert Slomp",
            definitions: [
                "De huiscomputer in de kornoelje. Voorziet de bewoners van muziek, films en vertier. Werkt vaak, maar niet altijd. Eigenlijk niet meer dan een groen printplaatje met wat kabeltjes eraan, begonnen als pielprojectje van M. G. Meedendorp. Vernoemd naar de Drentse legende, en vader van Robert ~, Bert Slomp."],
        },
        {
            word:       "Boane, de",
            definitions: ["De Reeperbahn te Hamburg waar de Expeditie eenmaal per ongeluk haar overnachting had geboekt, en de tweede keer bewust."],
        },
        {
            word:       "Beer’n",
            definitions: ["Poepen, nummer 2. De afkomst van het woord komt van de uitspraak:’in Utrecht hebb’n ze ook broene beern’. Voorbeeldzin:’Ben er zo weer, mot eem beern.’"],
        },
        {
            word:       "Blokje",
            definitions: ["Een Japans voertuig in de vorm van een kubus."],
        },
        {
            word:       "Boine, de schaal van",
            definitions: ["Een logaritmische schaal om de intensiteit van een scheet me aan te geven. Schaal loopt op tot de oerknal. Vernoemd naar R. B. Kremer tijdens de Noordkaap trip."],
        },
        {
            word:       "Corrupt",
            definitions: ["Uitdrukking en verklaring voor het niet functioneren van iets, bijvoorbeeld een robot of Bert Slomp."],
        },
        {
            word:       "Fikkerij",
            definitions: ["Seks, vrijen. Wordt vaak gebruikt als werkwoord in de Duitse zin:’Sprechen sie Deutsch? Wollen sie fikkn?’"],
        },
        {
            word:       "Gestapo Marion",
            definitions: ["Synoniem voor Marion Meedendorp. Bedacht door R. Sandee in zijn jonge jaren."],
        },
        {
            word:       "Jonkje",
            definitions: [
                "Kan worden gebruikt ter vervanging van vele zelfstandige naamwoorden.  Voorbeeld: ’Dat zijn een paar mooie jonkjes.’ Waar jonkjes het woord voor sokken vervangt.",
                "Bijnaam voor M. G. Meedendorp.",
            ],
        },
        {
            word:       "Kerosine",
            definitions: ["Bizar sterke koffie, gebrouwen door R. Sandee. Ultiem hulpmiddel voor chauffeurs en bijrijders tijdens lange roadtrips."],
        },
        {
            word:       "Kökbörü",
            definitions: ["De nationale sport van Kyrgyzstan waar men al rijdend op een paard een dood geit in een put moet gooien. Tevens ook de meest recente toevoeging aan bijnamen voor R. M. Atema. Is afgeleid van het woord Koukerū."],
        },
        {
            word:       "Koukerū",
            definitions: ["Japanse bijnaam voor R. M. Atema. Is afgeleid van het woord Atekouk."],
        },
        {
            word:       "Marjonkje",
            definitions: ["Zie Gestapo Marion. Origine van het woord is onbekend."],
        },
        {
            word:       "Matthaüs Barfsion",
            definitions: ["Zeer zelden gebruikte uitdrukking voor het legen van de maaginhoud in een museum. De origine van het woord is een uitstapje naar het Darwin Museum te Moskou met een Matthaüs Barfsion ten gevolge."],
        },
        {
            word:       "Patronkje",
            definitions: ["Synoniem voor lachgaspatronen. Voor het eerst gebruikt vlak na de oprichting van ‘de geheime jonkjes van Ashgabad’"],
        },
        {
            word:       "Piethoane, een dikke",
            definitions: ["Het woord betekent letterlijk penis. Echter, wordt vaak gebruikt voor een braadworst of ander voedsel in de vorm van een penis. Uitdrukking is ontstaan tijdens de Balkan reis waar R. Sandee knakworsten weigerde te eten en in plaats daarvan braadworsten at. Op een kampeerdag in Roemenië maakte M. H. Nuus daarom de opmerking:’een dikke piethoane veur Sandee’, nadat een braadworst door R. B. Kremer in de pan werd gelegd."],
        },
        {
            word:       "Pietje Barf",
            definitions: ["De inhoud van de maag legen in een ziplock of iets vergelijkbaars tijdens een busrit. Vernoemd naar Pietje Bel, ofwel R. B. Kremer tijdens een busrit in Abchazië."],
        },
        {
            word:       "Poolse jeten",
            definitions: ["Shotglaasjes in de vorm van een rondborstig vrouwelijk bovenlichaam, gekleed in een bikini bovenstuk in de kleuren van de Poolse vlag. De glaasjes worden van feest op feest aan elkaar overgedragen van gast naar host. Traditie is begonnen in het appartement van R. Steneker."],
        },
        {
            word:       "Punt'n",
            definitions: ["Een vervange munteenheid voor buitenlandse valuta. Wordt vooral gebruikt ook reizen waar veel landen met verschillende valuta worden bezocht om verwarring te voorkomen."],
        },
        {
            word:       "Punt'n, honderd",
            definitions: ["Iets wat dermate interessant, belonend, lovend, ‘cool’, of bewonderends waardig is dat het deze ‘100 punt'n’ verdient. Uitdrukking geïntrodiceerd door R. Slomp tijdens de Balkanreis."],
        },
        {
            word:       "Sankouk",
            definitions: ["Pannekouken op primitieve wijze gemaakt door R. Sandee. Uniek door het geheime ingrediënt whiskey."],
        },
        {
            word:       "Stronkje",
            definitions: ["Een Japanse drankje waar wodka is gemengd met een fruitig sapje wat koolzuur bevat. Alcoholpercentage wordt bij het nuttigen altijd sterk onderschat."],
        },
        {
            word:       "Team Rood/Blauw",
            definitions: ["Een tweedeling in een zestal leden van Expeditie gemaakt in Japan op basis van de kleur van het kerstpak. Tussen de teams is een strijd gaande wie de meeste vrouwen kan regelen en mee naar bed kan nemen. Team Rood, bestaande uit Ronald, Diederik en Matthijs, leidt op dit moment met 21-11 tegenover Blauw bestaande uit Martijn, Martijn en Maurice."],
        },
        {
            word:       "Unit",
            definitions: ["Eenheid voor vrijwel alles. Bij het zien van een groot voorwerp kan men bijvoorbeeld zeggen:’Dat is een flinke unit.’"],
        },
    ].sort((entry1, entry2) => {
        if(entry1.word < entry2.word)
            return -1
        if(entry1.word > entry2.word)
            return 1
        return 0
    })

    export function init(app: express.Express) {
        app.get('/woordenboek', (req, res) => res.render('woordenboek', {dictionary: dictionary}))
    }
}