import gulp from 'gulp';

/*
 * Load individual tasks from other files
 */
import clientTask from './gulp-files/client.mjs';
gulp.task('client:dev', clientTask(gulp, { dev: true }));
gulp.task('client:prod', clientTask(gulp, { prod: true }));
gulp.task('client:watch', clientTask(gulp, { watch: true }));

import copyTask from './gulp-files/copy.mjs';
gulp.task('copy:dev', copyTask(gulp, { dev: true }));
gulp.task('copy:prod', copyTask(gulp, { prod: true }));
gulp.task('copy:watch', copyTask(gulp, { watch: true }));

import serverTask from './gulp-files/server.mjs';
gulp.task('server:dev', serverTask(gulp, { dev: true }));
gulp.task('server:prod', serverTask(gulp, { prod: true }));
gulp.task('server:watch', serverTask(gulp, { watch: true }));

import stylesTask from './gulp-files/styles.mjs';
gulp.task('styles:dev', stylesTask(gulp, { dev: true }));
gulp.task('styles:prod', stylesTask(gulp, { prod: true }));
gulp.task('styles:watch', stylesTask(gulp, { watch: true }));

import errorPagesTask from './gulp-files/errorpages.mjs';
gulp.task('errorpages:dev', errorPagesTask(gulp, { dev: true }));
gulp.task('errorpages:prod', errorPagesTask(gulp, { prod: true }));
gulp.task('errorpages:watch', errorPagesTask(gulp, { watch: true }));

/*
 * Load tasks that apply to multiple components
 * Mostly tasks composed of the individual tasks
 */

gulp.task(
  'build:dev',
  gulp.parallel('client:dev', 'copy:dev', 'server:dev', 'styles:dev', 'errorpages:dev')
);

gulp.task(
  'build:prod',
  gulp.series(
    gulp.parallel('client:prod', 'styles:prod', 'server:prod'),
    gulp.parallel('copy:prod', 'errorpages:prod')
  )
);

gulp.task(
  'watch',
  gulp.series(
    gulp.parallel('client:watch', 'copy:dev', 'server:dev', 'styles:dev', 'errorpages:dev'),
    gulp.parallel('copy:watch', 'server:watch', 'styles:watch', 'errorpages:watch')
  )
);
