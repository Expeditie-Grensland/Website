module.exports = (gulp, plugins) => () =>
    gulp.src([
        'config/**/*',
        'locales/**/*',
        'public/loading.svg',
        'views/**/*'
    ], { base: './' })
        .pipe(plugins.newer({ dest: 'dist/' }))
        .pipe(gulp.dest('dist/'));
