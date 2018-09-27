module.exports = (gulp, plugins) => () =>
    gulp.src('src/public/styles/**/*.styl')
        .pipe(plugins.newer({dest: 'dist/public/styles/', ext: '.css', extra: 'dist/public/styles/**/*.css'}))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.stylus())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('dist/public/styles/'));
