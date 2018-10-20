import typescript from 'gulp-typescript';

module.exports = (gulp) => {
    const project = typescript.createProject('src/server/tsconfig.json');

    return () =>
        project.src()
            .pipe(project())
            .js
            .pipe(gulp.dest('dist/server/'));
};
