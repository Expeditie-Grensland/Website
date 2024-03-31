import pug from "gulp-pug";
import rename from "gulp-rename";
import mergeStream from "merge-stream";
import revRewrite from "gulp-rev-rewrite";
import { readFileSync } from "node:fs";

const httpCodes = Object.entries({
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
});

export default (gulp) => {
  // errorpages:prod
  return () => {
    mergeStream(
      ...httpCodes.map(([code, message]) =>
        gulp
          .src("src/views/public/error.pug")
          .pipe(pug({ data: { code, message, noLoginLink: true } }))
          .pipe(rename(`${code}.html`))
          .pipe(
            revRewrite({
              manifest: readFileSync("dist/static/styles/rev-manifest.json"),
              modifyUnreved: (x) => "styles/" + x,
              modifyReved: (x) => "styles/" + x,
            })
          )
          .pipe(
            revRewrite({
              manifest: readFileSync("dist/static/scripts/rev-manifest.json"),
              modifyUnreved: (x) => "scripts/" + x,
              modifyReved: (x) => "scripts/" + x,
            })
          )
      )
    ).pipe(gulp.dest("dist/static/errorpages"));
  };
};
