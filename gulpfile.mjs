import gulp from "gulp";

/*
 * Load individual tasks from other files
 */
import clientTask from "./gulp-files/client.mjs";
gulp.task("client:dev", clientTask(gulp, { dev: true }));
gulp.task("client:prod", clientTask(gulp, { prod: true }));
gulp.task("client:watch", clientTask(gulp, { watch: true }));

/*
 * Load tasks that apply to multiple components
 * Mostly tasks composed of the individual tasks
 */

gulp.task("build:prod", gulp.series("client:prod"));

gulp.task("watch", gulp.series(gulp.parallel("client:watch")));
