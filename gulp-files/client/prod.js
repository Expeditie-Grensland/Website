module.exports = (gulp, plugins) => () =>
    gulp.src([
        'src/client/home.ts',
        'src/client/expeditie.ts',
        'src/client/dictionary.ts',
        'src/client/serviceWorker.ts'
    ], { read: false, base: 'src/client/' })
        .pipe(plugins.tap((file) => {
            file.contents =
                plugins.browserify({
                    entries: [file.path],
                    basedir: 'src/client/'
                })
                    .plugin(plugins.tsify)
                    .transform(plugins.babelify, { extensions: ['.ts', '.js'], presets: ['@babel/preset-env'] })
                    .bundle();

            file.path = file.path.replace('.ts', '.js');
        }))
        .pipe(plugins.buffer())
        .pipe(plugins.uglify())
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/static/scripts/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dist/static/scripts/'));
