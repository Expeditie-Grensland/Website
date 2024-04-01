import babelify from "babelify";
import browserify from "browserify";
import buffer from "gulp-buffer";
import filter from "gulp-filter";
import rev from "gulp-rev";
import terser from "gulp-terser";
import mergeStream from "merge-stream";
import tsify from "tsify";
import source from "vinyl-source-stream";
import watchify from "watchify";

const src = "src/client";

const entries = [
  `${src}/all.ts`,
  `${src}/public.ts`,
  `${src}/members.ts`,
  `${src}/expeditie.ts`,
  `${src}/expeditieMap.ts`,
  `${src}/expeditieMapWorker.ts`,
  `${src}/worker/index.ts`,
];

const workerFilter = filter(["**/*", "!**/worker.js"], { restore: true });

export default (gulp, opts = { prod: false, watch: false }) => {
  const dest = opts.prod ? "dist/static/scripts" : "dev/static/scripts";

  const bundle = (b, path) => {
    console.error(`Starting bundling ${path}`);
    return b
      .bundle()
      .on("end", () => console.error(`Finished bundling ${path}`))
      .pipe(source(path));
  };

  const bundleToDest = (b, path) => () => bundle(b, path).pipe(gulp.dest(dest));

  // client:dev, client:prod and client:watch
  return () => {
    const tasks = entries.map((entry) => {
      console.error(`Creating bundler for ${entry}`);

      const project = `${src}/tsconfig.json`;

      let b = browserify({
        entries: [entry],
        debug: !opts.prod,
        cache: {},
        packageCache: {},
      })
        .plugin(tsify, { project, files: [] })
        .transform(babelify, { extensions: [".ts", ".js"] });

      const path = entry
        .replace(".ts", ".js")
        .replace("/index.js", ".js")
        .replace(`${src}/`, "");

      if (opts.watch) b.plugin(watchify).on("update", bundleToDest(b, path));

      return bundle(b, path);
    });

    let stream = mergeStream(...tasks);

    if (opts.prod)
      stream = stream
        .pipe(buffer())
        .pipe(terser())
        .pipe(workerFilter)
        .pipe(rev())
        .pipe(workerFilter.restore)
        .pipe(gulp.dest(dest))
        .pipe(rev.manifest());

    return stream.pipe(gulp.dest(dest));
  };
};
