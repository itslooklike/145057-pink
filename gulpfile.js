'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var scss = require("postcss-scss");
var reporter = require('postcss-reporter');
var stylelint = require('stylelint');
var pug = require('gulp-pug');
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var browserSync = require('browser-sync').create();

gulp.task("symbols", function() {
  return gulp.src("img/**/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("."));
});

gulp.task("images", function() {
  return gulp.src("img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task('scss-lint', function() {
  gulp.src(['sass/**/*.scss','!sass/base/normalize.scss'])
    .pipe(postcss([
      stylelint(),
      reporter({ clearMessages: true })
    ],{ syntax: scss }));
});

gulp.task('style', ['scss-lint'], function() {
  gulp.src('sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss([
      autoprefixer({browsers: ['last 1 versions'], cascade: false}),
      mqpacker({sort: true})
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('css'))
    // .pipe(minify())
    // .pipe(rename("style.min.css"))
    // .pipe(gulp.dest("css"))
    .pipe(browserSync.stream({match: '**/*.css'}));
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

gulp.task('serve', ['style', 'pug', 'symbols'], function() {
  browserSync.init({
    server: '.',
    notify: false,
    open: false,
    cors: true,
    ui: false
  });

  gulp.watch('sass/**/*.{scss,sass}', ['style']);
  gulp.watch('pug/**/*.{pug,jade}', ['pug']);
  gulp.watch('img/*.svg', ['symbols']);
  gulp.watch('*.html').on('change', function() {
    browserSync.reload();
  });
});
