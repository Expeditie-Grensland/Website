import favicons from 'favicons';
import newer from 'gulp-newer';

module.exports = (gulp) => () =>
    gulp.src('src/static/favicon.png')
        .pipe(newer('dist/static/favicons/favicon.ico'))
        .pipe(favicons.stream({
            appName: 'Expeditie Grensland',
            developerName: 'Expeditie Admins',
            path: '/static/favicons/',
            url: 'https://expeditiegrensland.nl/',
            display: 'standalone',
            start_url: '/',
            html: 'include.html',
            pipeHTML: true,
            replace: true,
            loggin: true
        }))
        .pipe(gulp.dest('dist/static/favicons/'));
