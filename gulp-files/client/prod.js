module.exports = (gulp, plugins) => () => {
    const workerFilter = plugins.filter(['**/*', '!**/worker.js'], { restore: true });
    return gulp.src([
        'src/client/home.ts',
        'src/client/expeditie.ts',
        'src/client/dictionary.ts',
        'src/client/worker/index.ts'
    ], { read: false, base: 'src/client/' })
        .pipe(plugins.tap((file) => {
            const project = file.path.endsWith('/worker/index.ts') || file.path.endsWith('\\worker\\index.ts') ?
                'src/client/worker/tsconfig.json' : 'src/client/tsconfig.json';

            file.contents =
                plugins.browserify({
                    entries: [file.path],
                    basedir: 'src/client/'
                })
                    .plugin(plugins.tsify, { project })
                    .transform(plugins.babelify, { extensions: ['.ts', '.js'], presets: ['@babel/preset-env'] })
                    .bundle();

            file.path = file.path.replace('.ts', '.js').replace('/index.js', '.js').replace('\\index.js', '.js');
        }))
        .pipe(plugins.buffer())
        .pipe(plugins.uglify())
        .pipe(workerFilter)
        .pipe(plugins.rev())
        .pipe(workerFilter.restore)
        .pipe(gulp.dest('dist/static/scripts/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dist/static/scripts/'));
}
