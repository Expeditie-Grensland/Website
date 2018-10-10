module.exports = (gulp, plugins) => () =>
    gulp.src('src/styles/**/*.styl')
        .pipe(plugins.newer({dest: 'dist/static/styles/', ext: '.css', extra: 'dist/static/styles/**/*.css'}))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.stylus())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('dist/static/styles/'));
