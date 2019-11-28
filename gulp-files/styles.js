import autoprefixer from 'autoprefixer';
import del from 'del';
import newer from 'gulp-newer';
import postcss from 'gulp-postcss';
import rev from 'gulp-rev';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import sassCompiler from 'node-sass'
import sassPackageImporter from 'node-sass-package-importer';

sass.compiler = sassCompiler;

module.exports = (gulp, opts = { clean: false, prod: false, watch: false }) => {

    // styles:clean
    if (opts.clean)
        return () => del(['dist/static/styles/**']);

    // styles:watch
    if (opts.watch)
        return () => gulp.watch('src/styles/**/*.{sass,scss}', gulp.series('styles:dev'));

    // styles:dev and styles:prod
    return () => {
        let stream = gulp.src('src/styles/**/*.{sass,scss}')
            .pipe(newer({ dest: 'dist/static/styles/', ext: '.css', extra: 'dist/static/styles/**/*.css' }));

        if (opts.prod)
            stream = stream
                .pipe(sass({ importer: sassPackageImporter(), outputStyle: 'compressed', includePath: '../..' }))
                .pipe(postcss([autoprefixer({ env: '> 1% in NL, not dead' })]))
                .pipe(rev())
                .pipe(gulp.dest('dist/static/styles/'))
                .pipe(rev.manifest());
        else
            stream = stream
                .pipe(sourcemaps.init())
                .pipe(sass({ importer: sassPackageImporter(), includePath: '../..' }))
                .pipe(postcss([autoprefixer({ env: '> 1% in NL, not dead' })]))
                .pipe(sourcemaps.write());

        return stream.pipe(gulp.dest('dist/static/styles/'));
    }
};
