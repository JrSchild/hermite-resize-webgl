var fs = require('fs');
var gulp = require('gulp'); 
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var inject = require('gulp-inject-string');
var express = require('express');
var minify = require('./lib/minify-glsl');
var bower = require('./bower.json');

var banner = [
  '/**',
  ' * <%= bower.name %> - <%= bower.description %>',
  ' * @version <%= bower.version %>',
  ' * @link <%= bower.homepage %>',
  ' * @author <%= bower.authors.join(", ") %>',
  ' * @license <%= bower.license %>',
  ' */', ''].join('\n');

gulp.task('lint', function () {
  return gulp.src('src/hermite-resize-webgl.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function () {
  return gulp.src('src/hermite-resize-webgl.js')
    .pipe(header(banner, { bower: bower } ))
    .pipe(inject.append(loadShaders()))
    .pipe(gulp.dest('dist'))
    .pipe(rename('hermite-resize-webgl.min.js'))
    .pipe(uglify())
    .pipe(header(banner, { bower: bower } ))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
  gulp.watch('src/**/*', ['lint', 'scripts']);
});

gulp.task('server', function () {
  express()
    .use(express.static('./'))
    .listen(3000);
});

/**
 * Load + minify shaders and pass them back is includable string.
 */
function loadShaders() {
  var vertex = minify(fs.readFileSync('src/vertex-shader.glsl', 'utf-8'));
  var fragment = minify(fs.readFileSync('src/fragment-shader.glsl', 'utf-8'));

  return ['', '',
    'GLScale.Hermite = {',
    '  vertex: \'' + vertex + '\',',
    '  fragment: \'' + fragment + '\'',
    '};'
  ].join('\n');
}

gulp.task('default', ['lint', 'scripts', 'watch', 'server']);