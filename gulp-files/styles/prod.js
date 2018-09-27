module.exports = (gulp, plugins) => () =>
    gulp.src('src/public/styles/**/*.styl')
        .pipe(plugins.newer({dest: 'dist/public/styles/', ext: '.css', extra: 'dist/public/styles/**/*.css'}))
        .pipe(plugins.stylus({
            compress: true
        }))
        .pipe(gulp.dest('dist/public/styles/'));
