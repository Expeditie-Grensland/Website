module.exports = (gulp) => async () =>
    gulp.watch('src/server/**/*.ts', { delay: 2500 }, gulp.series('server:dev', 'server:run'));
