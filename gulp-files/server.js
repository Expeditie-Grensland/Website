import child_process from "child_process";
import del from 'del';
import newer from 'gulp-newer';
import sourcemaps from 'gulp-sourcemaps';
import typescript from 'gulp-typescript';

module.exports = (gulp, opts = { clean: false, prod: false, watch: false, run: false }) => {

    // server:clean
    if (opts.clean)
        return () => del(['dist/server/**']);

    // server:watch
    if (opts.watch)
        return async () => gulp.watch('src/server/**/*.ts', { delay: 2500 }, gulp.series('server:dev', 'server:run'));

    // server:run
    if (opts.run) {
        let node;

        process.on('exit', () => {
            if (node)
                node.kill();
        });

        return async () => {
            if (node)
                node.kill();

            node = child_process.spawn('node', ['--icu-data-dir=node_modules/full-icu', 'dist/server/server.js'], { stdio: 'inherit' });

            node.on('close', () => {
                console.log('Node closed');
            })
        }
    }

    // server:dev and server:prod
    return () => {
        const project = typescript.createProject('src/server/tsconfig.json');

        return project.src()
            .pipe(newer({ dest: 'dist/server/', ext: '.js' }))
            .pipe(sourcemaps.init())
            .pipe(project())
            .js
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('dist/server/'));
    }
};
