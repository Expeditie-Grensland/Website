import revRewrite from 'gulp-rev-rewrite';
import uglify from 'gulp-uglify';

module.exports = (gulp) =>
    gulp.parallel(
        () => gulp.src(['src/views/**/*', '!src/views/**/*.js'])
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
            }))
            .pipe(gulp.dest('dist/views/')),

        () => gulp.src('src/views/**/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('dist/views')),

        () => gulp.src([
            'src/config/**/*',
            '!src/config/config.json',
            'src/locales/**/*',
            'src/static/**/*',
        ], { base: 'src/' })
            .pipe(gulp.dest('dist/')),

        () => gulp.src([
            'LICENSE',
            'package.json',
            'package-lock.json',
            'README.md'
        ], { base: './' })
            .pipe(gulp.dest('dist/')));
