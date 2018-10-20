import newer from 'gulp-newer';
import sourcemaps from 'gulp-sourcemaps';
import typescript from 'gulp-typescript';

module.exports = (gulp) => () => {
    const project = typescript.createProject('src/server/tsconfig.json');

    return project.src()
        .pipe(newer({ dest: 'dist/server/', ext: '.js' }))
        .pipe(sourcemaps.init())
        .pipe(project())
        .js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/server/'));
};
