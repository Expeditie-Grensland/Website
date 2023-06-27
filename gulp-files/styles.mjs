import autoprefixer from 'autoprefixer';
import { deleteAsync } from 'del';
import newer from 'gulp-newer';
import postcss from 'gulp-postcss';
import rev from 'gulp-rev';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import * as sassCompiler from 'sass';

const sass = gulpSass(sassCompiler);

export default (gulp, opts = { clean: false, prod: false, watch: false }) => {
  // styles:clean
  if (opts.clean) return () => deleteAsync(['dist/static/styles/**']);

  // styles:watch
  if (opts.watch)
    return () =>
      gulp.watch('src/styles/**/*.{sass,scss}', gulp.series('styles:dev'));

  // styles:dev and styles:prod
  return () => {
    let stream = gulp.src('src/styles/**/*.{sass,scss}').pipe(
      newer({
        dest: 'dist/static/styles/',
        ext: '.css',
        extra: [
          'dist/static/styles/**/*.css',
          'package-lock.json',
          'gulpfile.mjs',
          'gulp-files/*',
        ],
      })
    );

    if (opts.prod)
      stream = stream
        .pipe(sass({ outputStyle: 'compressed', includePath: '../..' }))
        .pipe(
          postcss([
            autoprefixer({ env: '> 1% in NL, not dead', cascade: false }),
          ])
        )
        .pipe(rev())
        .pipe(gulp.dest('dist/static/styles/'))
        .pipe(rev.manifest());
    else
      stream = stream
        .pipe(sourcemaps.init())
        .pipe(sass({ includePath: '../..' }))
        .pipe(
          postcss([
            autoprefixer({ env: '> 1% in NL, not dead', cascade: false }),
          ])
        )
        .pipe(sourcemaps.write());

    return stream.pipe(gulp.dest('dist/static/styles/'));
  };
};
