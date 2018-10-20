import favicons from 'favicons';
import filter from 'gulp-filter';
import htmlmin from 'gulp-htmlmin';
import newer from 'gulp-newer';

const htmlFilter = filter('**/include.html', { restore: true });

module.exports = (gulp, opts = { prod: false }) => () => {
    let stream = gulp.src('src/static/favicon.png')
        .pipe(newer('dist/static/favicons/favicon.ico'))
        .pipe(favicons.stream({
            appName: 'Expeditie Grensland',
            appDescription: 'Here you\'ll find all expedities!',
            developerName: 'Expeditie Admins',
            developerUrl: 'https://github.com/Expeditie-Grensland',
            path: '/static/favicons/',
            url: 'https://expeditiegrensland.nl',
            display: 'standalone',
            start_url: '/',
            html: 'include.html',
            pipeHTML: true,
            replace: true,
            icons: {
                appleStartup: false
            }
        }));

    if (opts.prod)
        stream = stream
            .pipe(htmlFilter)
            .pipe(htmlmin({ collapseWhitespace: true }))
            .pipe(htmlFilter.restore);

    return stream
        .pipe(gulp.dest('dist/static/favicons/'));
};
