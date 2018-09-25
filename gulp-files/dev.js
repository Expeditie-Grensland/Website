module.exports = (gulp, plugins) =>
    gulp.parallel(
        'client:dev',
        'copy:dev',
        'favicons:build',
        'server:dev',
        'styles:dev'
    );
