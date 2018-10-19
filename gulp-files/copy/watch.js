module.exports = (gulp) => async () =>
    gulp.watch(['src/config/**/*',
            'src/locales/**/*',
            'src/static/loading.svg',
            'src/views/**/*'],
        gulp.series('copy:dev'));
