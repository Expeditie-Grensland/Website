const del = require('del');
const favicons = require('favicons').stream;
const fancyLog = require('fancy-log');
const gulp = require('gulp');
const newer = require('gulp-newer');
const sourcemaps = require('gulp-sourcemaps');
const childProcess = require('child_process');
const stylus = require('gulp-stylus');
const typescript = require('gulp-typescript');
const uglify = require('gulp-uglify');


const clientProject = typescript.createProject('public/scripts/tsconfig.json');

const clientBuild = () =>
    clientProject.src()
        .pipe(newer({dest: 'public/scripts-dist/', ext: '.js'}))
        .pipe(sourcemaps.init())
        .pipe(clientProject())
        .js
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/scripts-dist/'));

const clientClean = () =>
    del([
        'public/scripts-dist/**/*'
    ]);


const faviconBuild = () =>
    gulp.src('public/favicon/source-icon.png')
        .pipe(newer('public/favicon/favicon.ico'))
        .pipe(favicons({
            appName: 'Expeditie Grensland',
            developerName: 'Expeditie Admins',
            path: '/favicon/',
            url: 'https://expeditiegrensland.nl/',
            display: 'standalone',
            start_url: '/',
            html: 'include.html',
            pipeHTML: true,
            replace: true,
            loggin: true
        }))
        .on('error', fancyLog)
        .pipe(gulp.dest('public/favicon/'));

const faviconClean = () =>
    del([
        'public/favicon/**/*',
        '!public/favicon/source-icon.png'
    ]);


const serverProject = typescript.createProject('server/tsconfig.json');

const serverBuild = () =>
    serverProject.src()
        .pipe(newer({dest: 'server-dist/', ext: '.js'}))
        .pipe(sourcemaps.init())
        .pipe(serverProject())
        .js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('server-dist/'));

const serverClean = () =>
    del([
        'server-dist/**/*'
    ]);


const styleBuild = () =>
    gulp.src('public/styles/**/*.styl')
        .pipe(newer({dest: 'public/styles-dist/', ext: '.css', extra: 'public/styles-dist/**/*.css'}))
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/styles-dist/'));

const styleClean = () =>
    del([
        'public/styles-dist/**/*'
    ]);


let node;

const server = async () => {
    if (node) node.kill();

    node = childProcess.spawn('node', ['server-dist/server.js'], {stdio: 'inherit'});

    node.on('close', () => {
        fancyLog('Node closed, waiting for changes...');
    });
};

process.on('exit', () => {
    if (node) node.kill()
});


const build = gulp.parallel(clientBuild, faviconBuild, serverBuild, styleBuild);

const clean = gulp.parallel(clientClean, faviconClean, serverClean, styleBuild);

const watch = gulp.series(build, server, async () => {
    gulp.watch('public/scripts/**/*.ts', clientBuild);
    gulp.watch('public/favicon/source-icon.png', faviconBuild);
    gulp.watch('server/**/*.ts', {delay: 2500}, gulp.series(serverBuild, server));
    gulp.watch('public/styles/**/*.styl', styleBuild);
});


module.exports = {
    clientBuild,
    clientClean,
    faviconBuild,
    faviconClean,
    serverBuild,
    serverClean,
    styleBuild,
    styleClean,
    build,
    clean,
    watch,
    default: watch
};
