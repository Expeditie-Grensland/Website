module.exports = (gulp, plugins) => {
    const project = plugins.typescript.createProject('public/scripts/tsconfig.json');

    return () =>
        project.src()
            .pipe(plugins.newer({ dest: 'dist/public/scripts/', ext: '.js' }))
            .pipe(project())
            .js
            .pipe(gulp.dest('dist/public/scripts/'));
};
