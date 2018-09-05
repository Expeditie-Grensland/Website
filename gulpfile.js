const del = require('del');
const favicons = require('favicons').stream;
const fancyLog = require('fancy-log');
const gulp = require('gulp');
const newer = require('gulp-newer');
const sourcemaps = require('gulp-sourcemaps');
const stylus = require('gulp-stylus');
const typescript = require('gulp-typescript');


const clientProject = typescript.createProject('public/scripts/tsconfig.json');

const clientBuild = function () {
    return clientProject.src()
        .pipe(newer({dest: 'public/scripts-dist/', ext: '.js'}))
        .pipe(sourcemaps.init())
        .pipe(clientProject())
        .js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/scripts-dist/'));
};

const clientClean = function () {
    return del([
        'public/scripts-dist/**/*'
    ]);
};


const faviconBuild = function () {
    return gulp.src('public/favicon/source-icon.png')
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
            replace: true
        }))
        .on('error', fancyLog)
        .pipe(gulp.dest('public/favicon/'));
};

const faviconClean = function () {
    return del([
        'public/favicon/**/*',
        '!public/favicon/source-icon.png'
    ]);
};


const serverProject = typescript.createProject('server/tsconfig.json');

const serverBuild = function () {
    return serverProject.src()
        .pipe(newer({dest: 'server-dist/', ext: '.js'}))
        .pipe(sourcemaps.init())
        .pipe(serverProject())
        .js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('server-dist/'))
};

const serverClean = function () {
    return del([
        'server-dist/**/*'
    ]);
};


const styleBuild = function () {
    return gulp.src('public/styles/**/*.styl')
        .pipe(newer({dest: 'public/styles-dist/', ext: '.css', extra: 'server-dist/**/*.css'}))
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/styles-dist/'));

};

const styleClean = function () {
    return del([
        'public/styles-dist/**/*'
    ]);
};


const build = gulp.parallel(clientBuild, faviconBuild, serverBuild, styleBuild);
const clean = gulp.parallel(clientClean, faviconClean, serverClean, styleBuild);


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
    clean
};
