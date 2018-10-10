module.exports = (gulp, plugins) => () =>
    gulp.src('src/static/favicon.png')
        .pipe(plugins.newer('dist/static/favicons/favicon.ico'))
        .pipe(plugins.favicons.stream({
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
