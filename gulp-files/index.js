const gulp = require('gulp');
const plugins = require('gulp-load-plugins')({
    overridePattern: false,
    pattern: ['favicons', 'del']
});

const load = (path) => require(`./${path}`)(gulp, plugins);


gulp.task('client:clean', load('client/clean'));
gulp.task('client:dev', load('client/dev'));
gulp.task('client:prod', load('client/prod'));

gulp.task('copy:clean', load('copy/clean'));
gulp.task('copy:dev', load('copy/dev'));
gulp.task('copy:prod', load('copy/prod'));

gulp.task('favicons:build', load('favicons/build'));
gulp.task('favicons:clean', load('favicons/clean'));

gulp.task('server:clean', load('server/clean'));
gulp.task('server:dev', load('server/dev'));
gulp.task('server:prod', load('server/prod'));
gulp.task('server:run', load('server/run'));

gulp.task('styles:clean', load('styles/clean'));
gulp.task('styles:dev', load('styles/dev'));
gulp.task('styles:prod', load('styles/prod'));


gulp.task('clean', () => plugins.del(['dist/**']));

gulp.task('build:dev', gulp.parallel(
    'client:dev',
    'copy:dev',
    'favicons:build',
    'server:dev',
    'styles:dev'
));

gulp.task('build:prod', gulp.series('clean', gulp.parallel(
    'client:prod',
    'copy:prod',
    'favicons:build',
    'server:prod',
    'styles:prod'
)));

gulp.task('build', gulp.series('build:prod'));


gulp.task('once', gulp.series('build:dev', 'server:run'));

gulp.task('watch', gulp.series('build:dev', 'server:run', async () => {
    gulp.watch('src/public/scripts/**/*.ts', gulp.series('client:dev'));
    gulp.watch(['src/config/**/*', 'src/locales/**/*', 'src/public/loading.svg', 'src/views/**/*'], gulp.series('copy:dev'));
    gulp.watch('src/public/favicon.png', gulp.series('favicons:build'));
    gulp.watch('src/server/**/*.ts', { delay: 2500 }, gulp.series('server:dev', 'server:run'));
    gulp.watch('src/public/styles/**/*.styl', gulp.series('styles:dev'));
}));
