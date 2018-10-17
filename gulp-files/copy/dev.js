module.exports = (gulp, plugins) => gulp.parallel(
    () => gulp.src([
        'src/config/**/*',
        'src/locales/**/*',
        'src/static/**/*',
        'src/views/**/*'
    ], { base: 'src/' })
        .pipe(plugins.newer({ dest: 'dist/' }))
        .pipe(gulp.dest('dist/')),

    () => gulp.src('node_modules/cesium/Build/Cesium/**/*')
        .pipe(gulp.dest('dist/static/cesium/'))
);
