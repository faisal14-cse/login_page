import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import csscomb from 'gulp-csscomb';
import csso from 'gulp-csso';
import header from 'gulp-header';
import plumber from 'gulp-plumber';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import del from 'del';
import browserSync from 'browser-sync';
var reload = browserSync.reload;

var mode = require('gulp-mode')();

sass.compiler = require('node-sass');

var pkg = require('./package.json');
var banner = [
  '/**',
  ' * dgখাতা v<%= pkg.version %> - <%= pkg.description %>',
  ' * @copyright 2017-<%= new Date().getFullYear() %> <%= pkg.author %>',
  ' */',
  ''
].join('\n');

var _dirProduction = 'HTML';

const paths = {
  styles: {
    src: 'build/sass/main.sass',
    dest: 'assets/styles/',
    watch: 'build/sass/**/*.sass',
    destProd: _dirProduction+'/assets/styles/'
  },
  htmls: {
    src: '*.html',
    destProd: _dirProduction+'/'
  }
};
 
/*
 * For small tasks you can export arrow functions
 */
// export const clean = () => del([ paths.styles.dest, paths.scripts.dest, paths.fonts.destProd, _dirProduction ]);
export const clean = () => del([ paths.styles.dest, _dirProduction ]);

/*
 * You can also declare named functions and export them as tasks
 */

export function styles() { 
  return gulp.src(paths.styles.src) 
    .pipe(mode.development(sourcemaps.init())) 
    .pipe(sass()) 
    .pipe(plumber()) 
    .pipe(autoprefixer({ 
      cascade: false 
    })) 
    .pipe(csscomb()) 
    .pipe(header(banner, { pkg : pkg } )) 
    .pipe(mode.development(sourcemaps.write('.'))) 
    .pipe(gulp.dest(paths.styles.dest)) 
    .pipe(mode.production(csso())) 
    .pipe(header(banner, { pkg : pkg } )) 
    .pipe(mode.production(gulp.dest(paths.styles.destProd)))
    .pipe(browserSync.stream()); 
}

export function htmls() {
  return gulp.src(paths.htmls.src)
    .pipe(gulp.dest(paths.htmls.destProd));
}

/*
* You could even use `export as` to rename exported tasks
*/
function watchFiles() {
  gulp.watch(paths.styles.watch, styles);
  gulp.watch('*.html').on("change", reload);
}
export { watchFiles as watch };

/*
* Let's create a server
*/
export function serve() {
  browserSync.init({
    server: {
        baseDir: "."
    },
    notify: false
  });
}
 
/*
 * You can still use `gulp.task`
 * for example to set task names that would otherwise be invalid
 */
const run = gulp.series(clean, gulp.parallel(styles, serve, watchFiles));
const build = gulp.series(clean, gulp.parallel(styles, htmls));
gulp.task('run', run);
gulp.task('build', build);
 
/*
 * Export a default task
 */
export default run;
