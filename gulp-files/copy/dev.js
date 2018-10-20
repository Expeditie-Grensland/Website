import newer from 'gulp-newer';

module.exports = (gulp) => gulp.series(
    gulp.src([
        'src/config/**/*',
        'src/locales/**/*',
        'src/static/**/*',
        'src/views/**/*'
    ], { base: 'src/' })
        .pipe(newer({ dest: 'dist/' }))
        .pipe(gulp.dest('dist/')),

    () => gulp.src('node_modules/cesium/Build/Cesium/**/*')
        .pipe(gulp.dest('dist/static/cesium/'))
);
