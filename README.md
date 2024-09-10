# Expeditie Grensland Website

[![Build & Deploy](https://github.com/Expeditie-Grensland/Website/actions/workflows/build.yml/badge.svg)](https://github.com/Expeditie-Grensland/Website/actions/workflows/build.yml)

Zie <https://expeditiegrensland.nl>.

## NPM Scripts

De belangrijkste scripts, uit te voeren met `npm run`:

|                        |                                                            |
| ---------------------- | ---------------------------------------------------------- |
| `dev`                  | Draai de server en alle bouwstappen in kijk-modus          |
| `check`                | Draai alle checks om te kijken of het goed zit             |
| `build`                | Bouw de uiteindelijke versie van de website                |
| `start`                | Draai de met `build` gebouwde server                       |
| `cli`                  | Draai de met `build` gebouwde cli                          |
| `stats`                | Toon statistieken van de met `build` gebouwde bestanden    |
| `clean`                | Schoon de boel lekker op                                   |
| `db:create-migration`  | Creëer een nieuwe databank-migratie                        |
| `db:migrate`           | Pas alle databank-migraties toe (en genereer nieuwe types) |
| `util:generate-secret` | Genereer een geheime sleutel voor de koekjes/sessies       |
