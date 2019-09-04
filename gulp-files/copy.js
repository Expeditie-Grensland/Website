import del from 'del';
import newer from 'gulp-newer';
import revRewrite from 'gulp-rev-rewrite';
import terser from 'gulp-terser';
import mergeStream from 'merge-stream';

module.exports = (gulp, opts = { clean: false, prod: false, watch: false }) => {
    // copy:clean
    if (opts.clean)
        return () => del([
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

    // copy:watch
    if (opts.watch)
        return () => gulp.watch(['src/config/**/*', 'src/locales/**/*', 'src/static/loading.svg', 'src/views/**/*'], gulp.series('copy:dev'));

    // copy:dev and copy:prod
    return () => {
        let sources = [];

        if (opts.prod)
            sources = [
                gulp.src(['src/views/**/*', '!src/views/**/*.js'], { base: 'src/' })
                    .pipe(revRewrite({
                        manifest: gulp.src('dist/static/styles/rev-manifest.json'),
                        modifyUnreved: (x) => 'styles/' + x,
                        modifyReved: (x) => 'styles/' + x,
                        replaceInExtensions: ['.pug']
                    }))
                    .pipe(revRewrite({
                        manifest: gulp.src('dist/static/scripts/rev-manifest.json'),
                        modifyUnreved: (x) => 'scripts/' + x,
                        modifyReved: (x) => 'scripts/' + x,
                        replaceInExtensions: ['.pug']
                    })),

                gulp.src('src/views/**/*.js', { base: 'src/' })
                    .pipe(terser()),

                gulp.src([
                    'src/config/**/*',
                    '!src/config/config.json',
                    'src/locales/**/*',
                    'src/static/**/*',
                ], { base: 'src/' }),

                gulp.src([
                    'LICENSE',
                    'package.json',
                    'package-lock.json',
                    'README.md'
                ], { base: './' })
            ];

        else
            sources = [
                gulp.src([
                    'src/config/**/*',
                    'src/locales/**/*',
                    'src/static/**/*',
                    'src/views/**/*'
                ], { base: 'src/' })
                    .pipe(newer({ dest: 'dist/' }))
            ];

        return mergeStream(...sources)
            .pipe(gulp.dest('dist/'));
    }
};
