import del from 'del';
import gulp from 'gulp';

/*
 * Load individual tasks from other files
 * File name (component) in key is imported as function
 * Task types in value are passed on as function arguments to function
 * Tasks are registered as component:task
 */

const componentTasks = {
    client: ['dev', 'prod', 'clean', 'watch'],
    copy: ['dev', 'prod', 'clean', 'watch'],
    server: ['dev', 'prod', 'clean', 'watch', 'run'],
    styles: ['dev', 'prod', 'clean', 'watch']
};

Object.keys(componentTasks).forEach(comp =>
    componentTasks[comp].forEach(type =>
        gulp.task(`${comp}:${type}`, require(`./${comp}`)(gulp, { [type]: true }))));



/*
 * Load tasks that apply to multiple components
 * Mostly tasks composed of the individual tasks
 */

gulp.task('clean', () => del('dist/**'));

gulp.task('build:dev',
    gulp.parallel(
        'client:dev',
        'copy:dev',
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
            'server:dev',
            'styles:dev'
        ),
        'server:run',
        gulp.parallel(
            'copy:watch',
            'server:watch',
            'styles:watch'
        )
    )
);
