import del from 'del';
import newer from 'gulp-newer';
import rev from 'gulp-rev';
import sourcemaps from 'gulp-sourcemaps';
import stylus from 'gulp-stylus';

module.exports = (gulp, opts = { clean: false, prod: false, watch: false }) => {

    // styles:clean
    if (opts.clean)
        return () => del(['dist/static/styles/**']);

    // styles:watch
    if (opts.watch)
        return () => gulp.watch('src/styles/**/*.styl', gulp.series('styles:dev'));

    // styles:dev and styles:prod
    return () => {
        let stream = gulp.src('src/styles/**/*.styl')
            .pipe(newer({ dest: 'dist/static/styles/', ext: '.css', extra: 'dist/static/styles/**/*.css' }));

        if (opts.prod)
            stream = stream
                .pipe(stylus({ 'include css': true, compress: true }))
                .pipe(rev())
                .pipe(gulp.dest('dist/static/styles/'))
                .pipe(rev.manifest());
        else
            stream = stream
                .pipe(sourcemaps.init())
                .pipe(stylus({
                    'include css': true
                }))
                .pipe(sourcemaps.write());

        return stream.pipe(gulp.dest('dist/static/styles/'));
    }
};
