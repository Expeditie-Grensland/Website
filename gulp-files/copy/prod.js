module.exports = (gulp, plugins) =>
    gulp.parallel(
        () => gulp.src('src/views/**/*')
            .pipe(plugins.revRewrite({
                manifest: gulp.src('dist/public/styles/rev-manifest.json'),
                modifyUnreved: (x) => 'styles/' + x,
                modifyReved: (x) => 'styles/' + x,
                replaceInExtensions: ['.pug']
            }))
            .pipe(plugins.revRewrite({
                manifest: gulp.src('dist/public/scripts/rev-manifest.json'),
                modifyUnreved: (x) => 'scripts/' + x,
                modifyReved: (x) => 'scripts/' + x,
                replaceInExtensions: ['.pug']
            }))
            .pipe(gulp.dest('dist/views/')),

        () => gulp.src([
            'src/config/**/*',
            '!src/config/config.json',
            'src/locales/**/*',
            'src/public/loading.svg',
        ], { base: 'src/' })
            .pipe(gulp.dest('dist/')),

        () => gulp.src([
            'LICENSE',
            'package.json',
            'package-lock.json',
            'README.md'
        ], { base: './' })
            .pipe(gulp.dest('dist/')));
