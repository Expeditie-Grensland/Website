import newer from 'gulp-newer';
import sourcemaps from 'gulp-sourcemaps';
import stylus from 'gulp-stylus';

module.exports = (gulp) => () =>
    gulp.src('src/styles/**/*.styl')
        .pipe(newer({ dest: 'dist/static/styles/', ext: '.css', extra: 'dist/static/styles/**/*.css' }))
        .pipe(sourcemaps.init())
        .pipe(stylus())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/static/styles/'));
