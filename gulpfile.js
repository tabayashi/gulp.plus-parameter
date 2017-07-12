'use strict';
var gulp    = require('gulp');
var mocha   = require('gulp-mocha');
var plumber = require('gulp-plumber');

gulp.task('spec', function() {
  return gulp.src(['spec/**/*.js'], {read: false})
              .pipe(plumber())
              .pipe(mocha());
});

gulp.task('watch', function() {
  gulp.watch([
    'src/**/*.js',
    'spec/**/*.js',
  ], ['spec']);
});

gulp.task('default', ['watch']);
