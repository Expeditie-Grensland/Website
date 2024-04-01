import pug from "pug";
import { mkdir, writeFile } from "fs/promises";

await mkdir("dist/static/errorpages/", { recursive: true });

const errorCodes = {
  400: "Foute aanvraag",
  401: "Niet geautoriseerd",
  403: "Verboden toegang",
  404: "Niet gevonden",
  405: "Methode niet toegestaan",
  406: "Niet aanvaardbaar",
  500: "Interne serverfout",
  501: "Niet geïmplementeerd",
  502: "Slechte gateway",
  503: "Dienst niet beschikbaar",
  504: "Gateway timeout",
};

await Promise.all(
  Object.entries(errorCodes).map(([code, message]) =>
    writeFile(
      `dist/static/errorpages/${code}.html`,
      pug.renderFile("src/views/public/error.pug", {
        code,
        message,
        noLoginLink: true,
      })
    )
  )
);

console.error(`Generated ${Object.keys(errorCodes).length} error pages`);
