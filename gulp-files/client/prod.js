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
                    basedir: 'src/public/scripts/'
                })
                    .plugin(plugins.tsify)
                    .transform(plugins.babelify, { extensions: ['.ts', '.js'], presets: ['@babel/preset-env'] })
                    .bundle();

            file.path = file.path.replace('.ts', '.js');
        }))
        .pipe(plugins.buffer())
        .pipe(plugins.uglify())
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/public/scripts/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dist/public/scripts/'));
