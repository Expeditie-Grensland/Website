import del from 'del';
import favicons from 'favicons';
import filter from 'gulp-filter';
import htmlmin from 'gulp-htmlmin';
import newer from 'gulp-newer';

const htmlFilter = filter('**/include.html', { restore: true });

module.exports = (gulp, opts = { clean: false, prod: false, watch: false }) => {

    // favicons:clean
    if (opts.clean)
        return () => del(['dist/static/favicons/**']);

    // favicons:watch
    if (opts.watch)
        return () => gulp.watch('src/static/favicon.png', gulp.series('favicons:dev'));

    // favicons:dev and favicons:prod
    return () => {
        let stream = gulp.src('src/static/favicon.png')
            .pipe(newer('dist/static/favicons/favicon.ico'))
            .pipe(favicons.stream({
                appName: 'Expeditie Grensland',
                appDescription: 'Hier vind je alle expedities!',
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
                    appleStartup: false,
                    coast: false
                }
            }));

        if (opts.prod)
            stream = stream
                .pipe(htmlFilter)
                .pipe(htmlmin({ collapseWhitespace: true }))
                .pipe(htmlFilter.restore);

        return stream.pipe(gulp.dest('dist/static/favicons/'));
    }
};
