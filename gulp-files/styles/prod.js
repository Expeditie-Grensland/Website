import rev from 'gulp-rev';
import stylus from 'gulp-stylus';

module.exports = (gulp) => () =>
    gulp.src('src/styles/**/*.styl')
        .pipe(stylus({
            compress: true
        }))
        .pipe(rev())
        .pipe(gulp.dest('dist/static/styles/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/static/styles/'));
