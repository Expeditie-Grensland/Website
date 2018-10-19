import del from 'del';

module.exports = (gulp) => () =>
    del([
        'dist/server/**'
    ]);
