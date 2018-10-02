module.exports = (gulp, plugins) => () =>
    gulp.src('src/public/styles/**/*.styl')
        .pipe(plugins.stylus({
            compress: true
        }))
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/public/styles/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dist/public/styles/'));
