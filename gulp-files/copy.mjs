import { deleteAsync } from 'del';
import { readFileSync } from 'node:fs';
import newer from 'gulp-newer';
import revRewrite from 'gulp-rev-rewrite';
import terser from 'gulp-terser';
import mergeStream from 'merge-stream';

export default (gulp, opts = { clean: false, prod: false, watch: false }) => {
  // copy:clean
  if (opts.clean)
    return () =>
    deleteAsync([
        'dist/config/**',
        'dist/locales/**',
        'dist/static/**/*',
        '!dist/static/scripts/**',
        '!dist/static/styles/**',
        'dist/views/**',
        'dist/LICENSE',
        'dist/package.json',
        'dist/package-lock.json',
        'dist/README.md',
      ]);

  // copy:watch
  if (opts.watch)
    return () =>
      gulp.watch(
        [
          'src/config/**/*',
          'src/locales/**/*',
          'src/static/**/*',
          'src/views/**/*',
        ],
        gulp.series('copy:dev')
      );

  // copy:dev and copy:prod
  return () => {
    let sources = [];

    if (opts.prod)
      sources = [
        gulp
          .src(['src/views/**/*', '!src/views/**/*.js'], { base: 'src/' })
          .pipe(
            revRewrite({
              manifest: readFileSync('dist/static/styles/rev-manifest.json'),
              modifyUnreved: (x) => 'styles/' + x,
              modifyReved: (x) => 'styles/' + x,
              replaceInExtensions: ['.pug'],
            })
          )
          .pipe(
            revRewrite({
              manifest: readFileSync('dist/static/scripts/rev-manifest.json'),
              modifyUnreved: (x) => 'scripts/' + x,
              modifyReved: (x) => 'scripts/' + x,
              replaceInExtensions: ['.pug'],
            })
          ),

        gulp.src('src/views/**/*.js', { base: 'src/' }).pipe(terser()),

        gulp.src(
          [
            'src/config/**/*',
            '!src/config/config.json',
            'src/locales/**/*',
            'src/static/**/*',
          ],
          { base: 'src/' }
        ),
      ];
    else
      sources = [
        gulp
          .src(
            [
              'src/config/**/*',
              'src/locales/**/*',
              'src/static/**/*',
              'src/views/**/*',
            ],
            { base: 'src/' }
          )
          .pipe(
            newer({
              dest: 'dist/',
              extra: ['package-lock.json', 'gulpfile.mjs', 'gulp-files/*'],
            })
          ),
      ];

    return mergeStream(...sources).pipe(gulp.dest('dist/'));
  };
};
