import del from 'del';

module.exports = (gulp) => () =>
    del([
        'dist/static/scripts/**'
    ]);
