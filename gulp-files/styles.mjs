import purgecss from "@fullhuman/postcss-purgecss";
import autoprefixer from "autoprefixer";
import { deleteAsync } from "del";
import newer from "gulp-newer";
import postcss from "gulp-postcss";
import rev from "gulp-rev";
import gulpSass from "gulp-sass";
import sourcemaps from "gulp-sourcemaps";
import * as sassCompiler from "sass";

const sass = gulpSass(sassCompiler);

export default (gulp, opts = { clean: false, prod: false, watch: false }) => {
  // styles:clean
  if (opts.clean) return () => deleteAsync(["dist/static/styles/**"]);

  // styles:watch
  if (opts.watch)
    return () =>
      gulp.watch("src/styles/**/*.{sass,scss}", gulp.series("styles:dev"));

  // styles:dev and styles:prod
  return () => {
    let stream = gulp.src("src/styles/**/*.{sass,scss}").pipe(
      newer({
        dest: "dist/static/styles/",
        ext: ".css",
        extra: [
          "dist/static/styles/**/*.css",
          "package-lock.json",
          "gulpfile.mjs",
          "gulp-files/*",
        ],
      })
    );

    if (!opts.prod) stream = stream.pipe(sourcemaps.init());

    stream = stream
      .pipe(
        sass({
          includePath: "../..",
          outputStyle: opts.prod ? "compressed" : "expanded",
        })
      )
      .pipe(
        postcss([
          purgecss({
            content: ["src/views/**/*.pug", "src/client/story/**/*.ts"],
            variables: true,
            safelist: {
              standard: ["satellite-icon"],
              deep: [/^mapboxgl/],
            },
          }),
          autoprefixer({ env: "> 1% in NL, not dead", cascade: false }),
        ])
      );

    if (!opts.prod) stream = stream.pipe(sourcemaps.write());

    if (opts.prod)
      stream = stream
        .pipe(rev())
        .pipe(gulp.dest("dist/static/styles/"))
        .pipe(rev.manifest());

    return stream.pipe(gulp.dest("dist/static/styles/"));
  };
};
