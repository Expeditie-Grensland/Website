module.exports = (gulp) => async () =>
    gulp.watch('src/styles/**/*.styl', gulp.series('styles:dev'));
