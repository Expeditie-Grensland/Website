module.exports = (gulp, plugins) => () =>
    plugins.del([
        'dist/config/**',
        'dist/locales/**',
        'dist/public/loading.svg',
        'dist/views/**',
        'dist/LICENSE',
        'dist/package.json',
        'dist/package-lock.json',
        'dist/README.md'
    ]);
