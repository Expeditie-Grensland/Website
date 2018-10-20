import newer from 'gulp-newer';
import revRewrite from 'gulp-rev-rewrite';
import uglify from 'gulp-uglify';
import mergeStream from 'merge-stream';

module.exports = (gulp, opts = { prod: false }) => () => {
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
                .pipe(uglify()),

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
};
