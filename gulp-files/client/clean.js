module.exports = (gulp, plugins) => () =>
    plugins.del([
        'dist/static/scripts/**'
    ]);
