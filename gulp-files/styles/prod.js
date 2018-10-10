module.exports = (gulp, plugins) => () =>
    gulp.src('src/styles/**/*.styl')
        .pipe(plugins.stylus({
            compress: true
        }))
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/static/styles/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dist/static/styles/'));
