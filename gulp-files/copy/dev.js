import newer from 'gulp-newer';

module.exports = (gulp) => () =>
    gulp.src([
        'src/config/**/*',
        'src/locales/**/*',
        'src/static/**/*',
        'src/views/**/*'
    ], { base: 'src/' })
        .pipe(newer({ dest: 'dist/' }))
        .pipe(gulp.dest('dist/'));
