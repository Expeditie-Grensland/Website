module.exports = (gulp, plugins) => () =>
    gulp.src([
        'config/**/*',
        '!config/config.json',
        'locales/**/*',
        'public/loading.svg',
        'views/**/*',
        'LICENSE',
        'package.json',
        'package-lock.json',
        'README.md'
    ], { base: './' })
        .pipe(plugins.newer({ dest: 'dist/' }))
        .pipe(gulp.dest('dist/'));
