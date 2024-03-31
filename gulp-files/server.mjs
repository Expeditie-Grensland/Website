import child_process from 'node:child_process';
import sourcemaps from 'gulp-sourcemaps';
import typescript from 'gulp-typescript';

export default (
  gulp,
  opts = { clean: false, prod: false, watch: false, run: false }
) => {
  // server:watch
  if (opts.watch)
    return async () =>
      gulp.watch(
        'src/server/**/*.ts',
        { delay: 2500 },
        gulp.series('server:dev', 'server:run')
      );

  // server:run
  if (opts.run) {
    let node;

    process.on('exit', () => {
      if (node) node.kill();
    });

    return async () => {
      if (node) node.kill();

      node = child_process.spawn(
        'node',
        ['--enable-source-maps', '--icu-data-dir=node_modules/full-icu', 'dist/server/server.js'],
        { stdio: 'inherit' }
      );

      node.on('close', () => {
        console.log('Node closed');
      });
    };
  }

  // server:dev and server:prod
  return () => {
    const project = typescript.createProject('src/server/tsconfig.json');

    return project
      .src()
      .pipe(sourcemaps.init())
      .pipe(project())
      .js.pipe(sourcemaps.write())
      .pipe(gulp.dest('dist/server/'));
  };
};
