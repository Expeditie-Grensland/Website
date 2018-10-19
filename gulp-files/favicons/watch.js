module.exports = (gulp) => async () =>
    gulp.watch('src/static/favicon.png', gulp.series('favicons:build'));
