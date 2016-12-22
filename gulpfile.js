'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var scss = require('postcss-scss');
var reporter = require('postcss-reporter');
var stylelint = require('stylelint');
var pug = require('gulp-pug');
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();

var buildFolder = 'build';

gulp.task('clean', function() {
  return del(buildFolder);
});

gulp.task('copy', function() {
  return gulp.src([
    'fonts/**/*.{woff,woff2}',
    'img/**',
    'js/**'
  ], {
    base: '.'
  })
    .pipe(gulp.dest(buildFolder));
});

gulp.task('js', function() {
  return gulp.src(['js/**'], {base: '.'})
    .pipe(gulp.dest(buildFolder));
});


gulp.task('symbols', function() {
  return gulp.src(['img/**/*.svg'])
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest(buildFolder + '/img'));
});

gulp.task('images', function() {
  return gulp.src('img/**/*.{png,jpg,gif}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest(buildFolder + '/img'));
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
      // mqpacker({sort: function (a, b) {
      //   return a.localeCompare(b);
      // }}),
      autoprefixer({browsers: ['last 1 versions'], cascade: false})
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(buildFolder + '/css'))
    .pipe(browserSync.stream({match: '**/*.css'}))
    // .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(buildFolder + '/css'));
});

gulp.task('pug', function() {
  return gulp.src('pug/pages/*.{pug,jade}')
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
      basedir: 'pug'
    }))
    .pipe(gulp.dest(buildFolder));
});

gulp.task('serve', function() {
  browserSync.init({
    server: buildFolder,
    notify: false,
    open: false,
    cors: true,
    ui: false
  });

  gulp.watch('sass/**/*.{scss,sass}', ['style']);
  gulp.watch('pug/**/*.{pug,jade}', ['pug']);
  gulp.watch('js/**/*.js', ['js']);

  gulp.watch('img/*.svg', ['symbols']).on('change', function() {
    browserSync.reload();
  });

  gulp.watch(buildFolder + '/*.html').on('change', function() {
    browserSync.reload();
  });
});

gulp.task('build', function(callback) {
  runSequence('clean', ['copy', 'style','pug', 'symbols'], callback);
});
