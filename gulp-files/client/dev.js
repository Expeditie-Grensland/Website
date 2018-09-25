module.exports = (gulp, plugins) => {
    const project = plugins.typescript.createProject('src/public/scripts/tsconfig.json');

    return () =>
        project.src()
            .pipe(plugins.newer({ dest: 'dist/public/scripts/', ext: '.js' }))
            .pipe(plugins.sourcemaps.init())
            .pipe(project())
            .js
            .pipe(plugins.sourcemaps.write('.'))
            .pipe(gulp.dest('dist/public/scripts/'));
};
