module.exports = (gulp, plugins) => () =>
    plugins.del([
        'dist/favicons/**'
    ]);