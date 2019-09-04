import del from 'del';
import gulp from 'gulp';

const loadTask = (comp, file, type) =>
    gulp.task(`${comp}:${type || file}`, require(`./${comp}/${file}`)(gulp, { [type]: true }));

const loadTasks = (tasksObject) =>
    Object.keys(tasksObject).forEach(comp =>
        Array.isArray(tasksObject[comp]) ?
            tasksObject[comp].forEach(type => loadTask(comp, '.', type))
            : Object.keys(tasksObject[comp]).forEach(file =>
                Array.isArray(tasksObject[comp][file]) ?
                    tasksObject[comp][file].forEach(type => loadTask(comp, file, type))
                    : loadTask(comp, file, tasksObject[comp][file])));

loadTasks({
    client: [
        'dev',
        'clean',
        'prod',
        'watch'
    ],

    copy: {
        build: ['dev', 'prod'],
        clean: '',
        watch: ''
    },

    favicons: {
        build: ['dev', 'prod'],
        clean: '',
        watch: ''
    },

    server: {
        build: ['dev', 'prod'],
        clean: '',
        run: '',
        watch: ''
    },

    styles: {
        build: ['dev', 'prod'],
        clean: '',
        watch: ''
    }
});


gulp.task('clean', () => del('dist/**'));

gulp.task('build:dev',
    gulp.parallel(
        'client:dev',
        'copy:dev',
        'favicons:dev',
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
            'favicons:prod',
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
            'favicons:dev',
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
