'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var pug = require('gulp-pug');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();

gulp.task('style', function() {
  gulp.src('sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: [
          'last 2 versions'
        ],
        cascade: false
      })
    ]))
    .pipe(gulp.dest('css'))
    .pipe(server.stream());
});

gulp.task('pug', function buildHTML() {
  return gulp.src('pug/pages/*.{pug,jade}')
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
      basedir: 'pug'
    }))
    .pipe(gulp.dest('.'))
});

gulp.task('serve', ['style', 'pug'], function() {
  server.init({
    server: '.',
    notify: false,
    open: false,
    cors: true,
    ui: false
  });

  gulp.watch('sass/**/*.{scss,sass}', ['style']);
  gulp.watch('pug/**/*.{pug,jade}', ['pug']);
  gulp.watch('*.html').on('change', server.reload);
});
