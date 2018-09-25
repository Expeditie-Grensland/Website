module.exports = (gulp, plugins) =>
    gulp.series(
        'clean',
        gulp.parallel(
            'client:prod',
            'copy:prod',
            'favicons:build',
            'server:prod',
            'styles:prod'
        )
    );
