import { deleteAsync } from "del";
import pug from "gulp-pug";
import rename from "gulp-rename";
import mergeStream from "merge-stream";

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

export default (gulp, opts = { clean: false, prod: false, watch: false }) => {
  // errorpages:clean
  if (opts.clean) return () => deleteAsync(["dist/static/errorpages/*"]);

  // errorpages:watch
  if (opts.watch)
    return () =>
      gulp.watch(["src/views/public/error.pug"], gulp.series("errorpages:dev"));

  // errorpages:dev and errorpages:prod
  return () => {
    const errorPages = httpCodes.map(([code, message]) =>
      gulp
        .src("src/views/public/error.pug")
        .pipe(pug({ data: { code, message, noLoginLink: true } }))
        .pipe(rename(`${code}.html`))
    );

    return mergeStream(...errorPages).pipe(
      gulp.dest("dist/static/errorpages/")
    );
  };
};
