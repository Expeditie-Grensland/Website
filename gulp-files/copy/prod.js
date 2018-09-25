module.exports = (gulp, plugins) =>
    gulp.parallel(
        () => gulp.src([
            'src/config/**/*',
            '!src/config/config.json',
            'src/locales/**/*',
            'src/public/loading.svg',
            'src/views/**/*'
        ], { base: 'src/' })
            .pipe(plugins.newer({ dest: 'dist/' }))
            .pipe(gulp.dest('dist/')),

        () => gulp.src([
            'LICENSE',
            'package.json',
            'package-lock.json',
            'README.md'
        ], {base: './'})
            .pipe(plugins.newer({ dest: 'dist/' }))
            .pipe(gulp.dest('dist/')));
