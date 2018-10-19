import babelify from 'babelify';
import browserify from 'browserify';
import fancyLog from 'fancy-log';
import filter from 'gulp-filter';
import rev from 'gulp-rev';
import streamify from 'gulp-streamify';
import uglify from 'gulp-uglify';
import mergeStream from 'merge-stream'
import tsify from 'tsify';
import source from 'vinyl-source-stream';
import watchify from 'watchify';

let i = 0;

const entries = [
    'src/client/home.ts',
    'src/client/expeditie.ts',
    'src/client/dictionary.ts',
    'src/client/worker/index.ts'
];

const workerFilter = filter(['**/*', '!**/worker.js'], { restore: true });

module.exports = (gulp, opts = { prod: false, watch: false }) => {
    const bundle = (b, path) => {
        fancyLog(`Starting bundling ${path}`);
        return b
            .bundle()
            .on('end', () => fancyLog(`Finished bundling ${path}`))
            .pipe(source(path));
    };

    const bundleToDest = (b, path) => () =>
        bundle(b, path).pipe(gulp.dest('dist/static/scripts/'));

    return () => {
        const tasks = entries.map((entry) => {
            fancyLog(`Creating bundler for ${entry}`);

            const project = entry.endsWith('worker/index.ts') ?
                'src/client/worker/tsconfig.json' : 'src/client/tsconfig.json';

            let b = browserify({
                entries: [entry],
                debug: !opts.prod,
                cache: {},
                packageCache: {}
            })
                .plugin(tsify, { project })
                .transform(babelify, { extensions: ['.ts', '.js'], presets: ['@babel/preset-env'] });

            const path = entry
                .replace('.ts', '.js')
                .replace('/index.js', '.js')
                .replace('src/client/', '');

            if (opts.watch && !opts.prod) {
                b.plugin(watchify);
                b.on('update', bundleToDest(b, path));
            }

            return bundle(b, path);
        });

        if (opts.prod)
            return mergeStream(...tasks)
                .pipe(streamify(uglify()))
                .pipe(workerFilter)
                .pipe(streamify(rev()))
                .pipe(workerFilter.restore)
                .pipe(gulp.dest('dist/static/scripts/'))
                .pipe(rev.manifest())
                .pipe(gulp.dest('dist/static/scripts/'));
        else
            return mergeStream(...tasks)
                .pipe(gulp.dest('dist/static/scripts/'));
    }
};
