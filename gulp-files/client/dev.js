module.exports = (gulp, plugins) => () =>
    gulp.src([
        'src/public/scripts/home.ts',
        'src/public/scripts/expeditie.ts',
        'src/public/scripts/dictionary.ts'
    ], { read: false, base: 'src/public/scripts/' })
        .pipe(plugins.tap((file) => {
            file.contents =
                plugins.browserify({
                    entries: [file.path],
                    basedir: 'src/public/scripts/',
                    debug: true
                })
                    .plugin(plugins.tsify)
                    .bundle();

            file.path = file.path.replace('.ts', '.js');
        }))
        .pipe(plugins.buffer())
        .pipe(gulp.dest('dist/public/scripts'));
