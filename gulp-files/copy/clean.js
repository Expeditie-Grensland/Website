module.exports = (gulp, plugins) => () =>
    plugins.del([
        'dist/config/**',
        'dist/locales/**',
        'dist/static/**/*',
        '!dist/static/favicons/**',
        '!dist/static/scripts/**',
        '!dist/static/styles/**',
        'dist/views/**',
        'dist/LICENSE',
        'dist/package.json',
        'dist/package-lock.json',
        'dist/README.md'
    ]);
