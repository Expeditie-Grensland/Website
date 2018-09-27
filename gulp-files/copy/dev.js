module.exports = (gulp, plugins) => () =>
    gulp.src([
        'src/config/**/*',
        'src/locales/**/*',
        'src/public/loading.svg',
        'src/views/**/*'
    ], { base: 'src/' })
        .pipe(plugins.newer({ dest: 'dist/' }))
        .pipe(gulp.dest('dist/'));
