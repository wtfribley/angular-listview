var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var karma = require('gulp-karma');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var paths = {
  src: ['angular-listview.js'],
  karma: [
    'bower_components/angular/angular.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'angular-listview.js',
    'test/*.spec.js'
  ]
};

gulp.task('lint', function() {
  return gulp.src(paths.src)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jscs());
});

gulp.task('test', function() {
  return gulp.src(paths.karma)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) { throw err; });
});

gulp.task('test-watch', function() {
  return gulp.src(paths.karma)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});

gulp.task('build', function() {
 return gulp.src(paths.src)
  .pipe(rename({suffix: '.min', ext: '.js'}))
  .pipe(uglify())
  .pipe(gulp.dest('./'));
});

gulp.task('watch', ['test-watch'], function() {
  gulp.watch(paths.src, ['lint', 'build']);
});

gulp.task('default', ['build', 'watch']);
