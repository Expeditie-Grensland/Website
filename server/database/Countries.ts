export namespace Countries {
    export interface Country {
        id: string
    }

    export const countries: Country[] = [
        "Afghanistan", "Angola", "Albania", "Andorra", "United_Arab_Emirates", "Argentina", "Armenia", "Antarctica",
        "Fr._S._Antarctic_Lands", "Australia", "Austria", "Azerbaijan", "Burundi", "Belgium", "Benin", "Burkina_Faso",
        "Bangladesh", "Bulgaria", "Bahamas", "Bosnia_and_Herz.", "Belarus", "Belize", "Bolivia", "Brazil", "Brunei",
        "Bhutan", "Botswana", "Central_African_Rep.", "Canada", "Switzerland", "Chile", "China", "Côte_d'Ivoire",
        "Cameroon", "Dem._Rep._Congo", "Congo", "Colombia", "Costa_Rica", "Cuba", "N._Cyprus", "Cyprus", "Czech_Rep.",
        "Germany", "Djibouti", "Denmark", "Dominican_Rep.", "Algeria", "Ecuador", "Egypt", "Eritrea", "Spain",
        "Estonia", "Ethiopia", "Finland", "Fiji", "Falkland_Is.", "France", "Gabon", "United_Kingdom", "Georgia",
        "Ghana", "Guinea", "Gambia", "Guinea-Bissau", "Eq._Guinea", "Greece", "Greenland", "Guatemala", "Guyana",
        "Hong_Kong", "Honduras", "Croatia", "Haiti", "Hungary", "Indonesia", "India", "Ireland", "Iran", "Iraq",
        "Iceland", "Israel", "Italy", "Jamaica", "Jordan", "Japan", "Siachen_Glacier", "Kazakhstan", "Kenya",
        "Kyrgyzstan", "Cambodia", "Korea", "Kosovo", "Kuwait", "Lao_PDR", "Lebanon", "Liberia", "Libya",
        "Liechtenstein", "Sri_Lanka", "Lesotho", "Lithuania", "Luxembourg", "Latvia", "Macao", "St-Martin", "Morocco",
        "Monaco", "Moldova", "Madagascar", "Mexico", "Macedonia", "Mali", "Myanmar", "Montenegro", "Mongolia",
        "Mozambique", "Mauritania", "Malawi", "Malaysia", "Namibia", "New_Caledonia", "Niger", "Nigeria", "Nicaragua",
        "Netherlands", "Norway", "Nepal", "New_Zealand", "Oman", "Pakistan", "Panama", "Peru", "Philippines",
        "Papua_New_Guinea", "Poland", "Puerto_Rico", "Dem._Rep._Korea", "Portugal", "Paraguay", "Palestine", "Qatar",
        "Romania", "Russia", "Rwanda", "W._Sahara", "Saudi_Arabia", "Sudan", "S._Sudan", "Senegal",
        "S._Geo._and_S._Sandw._Is.", "Solomon_Is.", "Sierra_Leone", "El_Salvador", "San_Marino", "Somaliland",
        "Somalia", "Serbia", "Suriname", "Slovakia", "Slovenia", "Sweden", "Swaziland", "Sint_Maarten", "Syria", "Chad",
        "Togo", "Thailand", "Tajikistan", "Turkmenistan", "Timor-Leste", "Trinidad_and_Tobago", "Tunisia", "Turkey",
        "Taiwan", "Tanzania", "Uganda", "Ukraine", "Uruguay", "United_States", "Uzbekistan", "Venezuela", "Vietnam",
        "Vanuatu", "Yemen", "South_Africa", "Zambia", "Zimbabwe", "Ilemi_Triangle", "South_Ossetia", "Nagorno-Karabakh",
        "Aksai_Chin", "Kashmir", "Kashmir", "Kashmir", "Turkish_Republic_of_Northern_Cyprus", "Abkhazia", "Somaliland",
        "Western_Sahara", "Kashmir", "Kashmir", "Abyei",
    ].map((countryID) => <Country>{id: countryID})
}