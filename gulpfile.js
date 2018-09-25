const gulp = require('gulp');
const plugins = require('gulp-load-plugins')({
    overridePattern: false,
    pattern: ['favicons', 'del']
});

const load = (path) => require(`./gulp-files/${path}`)(gulp, plugins);

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

gulp.task('styles:clean', load('styles/clean'));
gulp.task('styles:dev', load('styles/dev'));
gulp.task('styles:prod', load('styles/prod'));

gulp.task('clean', load('clean'));
gulp.task('dev', load('dev'));
gulp.task('prod', load('prod'));

//
// const clientProject = typescript.createProject('public/scripts/tsconfig.json');
//
// const clientBuild = () =>
//     clientProject.src()
//         .pipe(newer({dest: 'public/scripts-dist/', ext: '.js'}))
//         .pipe(sourcemaps.init())
//         .pipe(clientProject())
//         .js
//         .pipe(uglify())
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest('public/scripts-dist/'));
//
// const clientClean = () =>
//     del([
//         'public/scripts-dist/**/*'
//     ]);
//
// let node;
//
// const server = async () => {
//     if (node) node.kill();
//
//     node = childProcess.spawn('node', ['server-dist/server.js'], {stdio: 'inherit'});
//
//     node.on('close', () => {
//         fancyLog('Node closed, waiting for changes...');
//     });
// };
//
// process.on('exit', () => {
//     if (node) node.kill()
// });
//
//
// const build = gulp.parallel(clientBuild, faviconBuild, serverBuild, styleBuild);
//
// const clean = gulp.parallel(clientClean, faviconClean, serverClean, styleClean);
//
// const cleanBuild = gulp.series(clean, build);
//
// const once = gulp.series(build, server);
//
// const watch = gulp.series(once, async () => {
//     gulp.watch('public/scripts/**/*.ts', clientBuild);
//     gulp.watch('public/favicon/source-icon.png', faviconBuild);
//     gulp.watch('server/**/*.ts', {delay: 2500}, gulp.series(serverBuild, server));
//     gulp.watch('public/styles/**/*.styl', styleBuild);
// });
//
