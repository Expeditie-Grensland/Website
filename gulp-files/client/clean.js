module.exports = (gulp, plugins) => () =>
    plugins.del([
        'dist/public/scripts/**'
    ]);