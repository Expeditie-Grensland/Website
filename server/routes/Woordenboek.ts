import * as express from "express"

export namespace Woordenboek {

    export type DictionaryEntry = {
        word: string,
        definitions: string[],
        audioFile?: string,
    }

    export const dictionary: DictionaryEntry[] = [
        {
            word: "Atema",
            definitions: [
                "Bijnaam voor —en tevens achternaam van— R. M. Atema",
                "Een vervanging voor vrijwel elk woord in vrijwel elke songtekst. Voorbeeld: 'Atemaaa, Ate-, Ate-, Ate-, Ate-maaa, ...' ipv 'Jag känner en bot. Hon heter Anna. Anna heter hon' in het nummer 'Boten Anna' van Basshunter."
            ]
        },
        {
            word:       'Atebarf',
            definitions: ["Al rijdende in een voertuig uw maaginhoud legen door het raam. Vernoemd naar R. M. Atema tijdens de examenuitreiking van R. Slomp."]
        },
        {
            word:       'Atekouk',
            definitions: [
                "Pannekoeken (Gronings: Pankouk) op primitive wijze gemaakt door R. M. Atema. Verder geen specificaties bekend.",
                "Bijnaam voor R. M. Atema. Voor het eerst op deze wijze gebruikt door M. H. Nuus op Expeditie Balkan."
            ]
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
            definitions: ["Bizar sterke koffie, gebrouwen door R. Sandee. Ultiem hulpmiddel voor chauffeurs en bijrijders tijdens lange ritten. Kerosine bestaat uit de dubbele aanbevolen hoeveelheden koffiepoeder, plus een schep suiker voor elke aanbevolen schep koffiepoeder."],
        },
        {
            word:       "Kökbörü",
            definitions: [
                "De nationale sport van Kyrgyzstan waar men al rijdend op een paard een dood geit in een put moet gooien.",
                "De meest recente toevoeging aan bijnamen voor R. M. Atema. Is afgeleid van het woord Koukerū."
            ],
        },
        {
            word:       "Koukerū",
            definitions: ["Japanse bijnaam voor R. M. Atema. Is afgeleid van het woord Atekouk."],
        },
        {
            word:       "Matthaüs Barfsion",
            definitions: ["Zeer zelden gebruikte uitdrukking voor het legen van de maaginhoud in een museum. De origine van het woord is een uitstapje naar het Darwin Museum te Moskou met een Matthaüs Barfsion ten gevolge."],
        },
        {
            word: "May Ke",
            definitions: [
                "De (voormalige) Facebook gebruikersnaam van Maaike Schuurke, moeder van R. M. Atema. Daarna redelijk snel overgenomen door de expeditieleden als vaste bijnaam. Ook bekend van het nummer met de titel (en tevens enige songtekst) 'May Ke m'n liefste Cay Ke'."
            ]
        },
        {
            word: "Noorman, De",
            definitions: [
                "De bijnaam van H. (Erik) Meedendorp, vader van M. G. Meedendorp. Ontstaan door het zijn uiterlijk, dat met een dikke bos blond haar en een grof postuur sterk overeenkomt met die van de oude Noormannen."
            ]
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
            definitions: ["Iets wat dermate interessant, belonend, lovend, ‘cool’, of bewonderends waardig is dat het deze ‘100 punt'n’ verdient. Uitdrukking geïntroduceerd door R. Slomp tijdens de Balkanreis."],
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
        {
            word:       "Kapot",
            definitions: ["Een mentale en fysieke gemoedstoestand die een of meerdere malen per Expeditie bereikt kan worden door onder meer slaaptekort, lokale zuivel (vooral yoghurtjes en kaas), drank en onderweg zijn. Symptomen: bearspray, barfen, extreme vermoeidheid en het opgeven van activiteit waar een gezond jonkje U tegen zegt (bijvoorbeeld Khazbegi of een avondje in Minsk)."],
            audioFile: "kapot.mp3"
        },
        {
            word: "Bearspray",
            definitions: ["Synoniem voor explosieve diarree. Een combinatie van beer'n en sprayen in <i>bear country</i> in Finland. Voor het eerst gebruikt op Expeditie Noordkaap bij het kamp bij Kolimajärvi waar na een pan elandpasta vier jonkjes het bos in trokken met een rol toiletpapier.", "Een van de mogelijke symptomen van kapot gaan."]
        },
        {
            word: "Berliner Jungs",
            definitions: ["De groep jongens die in de zomer van 2016 een midweek met de flixbus naar Berlijn is geweest. Bestaande uit: R.B. Kremer, M.H. Nuus, R.M. Atema en M.G. Meedendorp."]
        },
        {
            word: "Backseat boys",
            definitions: ["Een bijnaam voor M.H. Nuus en R.M. Atema. Ontstaan doordat ze tijdens EXPEDITIE Holte & Moi constant in de achterste rij stoelen in de Marion Mobilae zaten."]
        },
        {
            word: "Marion Mobilae",
            definitions: ["De Toyota Previa van M.J.S.M. (Marion) Meedendorp, die mee was op EXPEDITIE Holte & Moi. De naam is afgeleid van perpetuum mobile, omdat de auto ondanks alle piepende, krakende en versleten onderdelen toch altijd door bleef rijden."]
        },
        {
            word: "Baku boys",
            definitions: ["Een bijnaam voor R.M. Atema, R.B. Kremer en M.G. Meedendorp, die tijdens EXPEDITIE Kaukasus hun reis begonnen in Baku, in tegenstelling tot M.H. Nuus en D.H. Blaauw die in Teheran begonnen."]
        },
        {
            word: "Gagarin, naar ~ gaan",
            definitions: ["Trippen, van de wereld gaan. Vaak onder invloed van, maar niet gelimiteerd tot, snus, alcohol, patronkjes of op de kop gezichten bekijken."]
        },
        {
            word: "Vråltjes",
            definitions: ["Zweedse dropjes genaamd Djunglevrål, een vast onderdeel van expedities door Scandinavië."]
        },
        {
            word: "Jonkjes, Poolse",
            definitions: ["Kleurrijke, gekke sokken van het merk Many Mornings uit Polen. Voor het eerst gedragen tijdens EXPEDITIE Holte & Moi."]
        },
        {
            word: "Atehouk",
            definitions: ["De twee achterste hoeken van de Marion Mobilae, waar R.M. Atema als onderdeel van de Backseat boys zich bevond tijdens EXPEDITIE Holte & Moi."]
        },
        {
            word: "Matthew McNuus",
            definitions: ["Een manier van urineren in een rijdende auto die bestaat uit het plassen in een fles en die vervolgens uit het raam gooien. De grondlegger van dit fenomeen is M.H. Nuus."]
        }
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