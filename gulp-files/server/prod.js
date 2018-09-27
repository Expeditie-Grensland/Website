module.exports = (gulp, plugins) => {
    const project = plugins.typescript.createProject('src/server/tsconfig.json');

    return () =>
        project.src()
            .pipe(plugins.newer({ dest: 'dist/server/', ext: '.js' }))
            .pipe(project())
            .js
            .pipe(gulp.dest('dist/server/'));
};
