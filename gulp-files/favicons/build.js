module.exports = (gulp, plugins) => () =>
    gulp.src('public/favicon/source-icon.png')
        .pipe(plugins.newer('dist/public/favicons/favicon.ico'))
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
        .pipe(gulp.dest('dist/public/favicons/'));
