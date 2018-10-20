import babelify from 'babelify';
import browserify from 'browserify';
import del from 'del';
import fancyLog from 'fancy-log';
import filter from 'gulp-filter';
import rev from 'gulp-rev';
import streamify from 'gulp-streamify';
import uglify from 'gulp-uglify';
import mergeStream from 'merge-stream';
import tsify from 'tsify';
import source from 'vinyl-source-stream';
import watchify from 'watchify';


const src = 'src/client';
const dest = 'dist/static/scripts';

const entries = [
    `${src}/home.ts`,
    `${src}/expeditie.ts`,
    `${src}/dictionary.ts`,
    `${src}/worker/index.ts`
];

const workerFilter = filter(['**/*', '!**/worker.js'], { restore: true });

module.exports = (gulp, opts = { clean: false, prod: false, watch: false }) => {
    if (opts.clean)
        return () => del(`${dest}/**`);

    const bundle = (b, path) => {
        fancyLog(`Starting bundling ${path}`);
        return b
            .bundle()
            .on('end', () => fancyLog(`Finished bundling ${path}`))
            .pipe(source(path));
    };

    const bundleToDest = (b, path) => () =>
        bundle(b, path).pipe(gulp.dest(dest));

    return () => {
        const tasks = entries.map((entry) => {
            fancyLog(`Creating bundler for ${entry}`);

            const project = entry.endsWith('worker/index.ts') ?
                `${src}/worker/tsconfig.json` : `${src}/tsconfig.json`;

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
                .replace(`${src}/`, '');

            if (opts.watch && !opts.prod)
                b
                    .plugin(watchify)
                    .on('update', bundleToDest(b, path));

            return bundle(b, path);
        });

        let stream = mergeStream(...tasks);

        if (opts.prod)
            stream = stream
                .pipe(streamify(uglify()))
                .pipe(workerFilter)
                .pipe(streamify(rev()))
                .pipe(workerFilter.restore)
                .pipe(gulp.dest(dest))
                .pipe(rev.manifest());

        return stream.pipe(gulp.dest(dest));
    }
};
