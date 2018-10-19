import del from 'del';
import gulp from 'gulp';

const load = (path, ...args) => require(`./${path}`)(gulp, ...args);

gulp.task('client:clean', load('client/clean'));
gulp.task('client:dev', load('client/build'));
gulp.task('client:prod', load('client/build', { prod: true }));
gulp.task('client:watch', load('client/build', { watch: true }));

gulp.task('copy:clean', load('copy/clean'));
gulp.task('copy:dev', load('copy/dev'));
gulp.task('copy:prod', load('copy/prod'));
gulp.task('copy:watch', load('copy/watch'));

gulp.task('favicons:build', load('favicons/build'));
gulp.task('favicons:clean', load('favicons/clean'));
gulp.task('favicons:watch', load('favicons/watch'));

gulp.task('server:clean', load('server/clean'));
gulp.task('server:dev', load('server/dev'));
gulp.task('server:prod', load('server/prod'));
gulp.task('server:run', load('server/run'));
gulp.task('server:watch', load('server/watch'));

gulp.task('styles:clean', load('styles/clean'));
gulp.task('styles:dev', load('styles/dev'));
gulp.task('styles:prod', load('styles/prod'));
gulp.task('styles:watch', load('styles/watch'));

gulp.task('clean', () => del('dist/**'));

gulp.task('build:dev',
    gulp.parallel(
        'client:dev',
        'copy:dev',
        'favicons:build',
        'server:dev',
        'styles:dev'
    )
);

gulp.task('build:prod',
    gulp.series(
        'clean',
        gulp.parallel(
            'client:prod',
            'styles:prod',
            'favicons:build',
            'server:prod',
        ),
        gulp.parallel(
            'copy:prod'
        )
    )
);


gulp.task('once', gulp.series('build:dev', 'server:run'));

gulp.task('watch',
    gulp.series(
        gulp.parallel(
            'client:watch',
            'copy:dev',
            'favicons:build',
            'server:dev',
            'styles:dev'
        ),
        'server:run',
        gulp.parallel(
            'copy:watch',
            'favicons:watch',
            'server:watch',
            'styles:watch'
        )
    )
);
