import sourcemaps from "gulp-sourcemaps";
import typescript from "gulp-typescript";

export default (
  gulp,
  opts = { clean: false, prod: false, watch: false, run: false }
) => {
  // server:watch
  if (opts.watch)
    return async () =>
      gulp.watch(
        "src/server/**/*.ts",
        { delay: 2500 },
        gulp.series("server:dev")
      );

  // server:dev and server:prod
  return () => {
    const project = typescript.createProject("src/server/tsconfig.json");

    return project
      .src()
      .pipe(sourcemaps.init())
      .pipe(project())
      .js.pipe(sourcemaps.write())
      .pipe(gulp.dest("dist/server/"));
  };
};
