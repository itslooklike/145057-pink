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
var fs = require('fs');
var data = require('gulp-data');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();

var buildFolder = 'docs';
var srcFolder = 'src';

gulp.task('clean', function() {
  return del(buildFolder);
});

gulp.task('copy', function() {
  return gulp
    .src(
      [
        `${srcFolder}/assets/fonts/**/*.{woff,woff2}`,
        `${srcFolder}/assets/img/**/*.svg`,
        `${srcFolder}/js/**`,
      ],
      {
        base: srcFolder,
      }
    )
    .pipe(gulp.dest(buildFolder));
});

gulp.task('symbols', function() {
  return gulp
    .src(`${srcFolder}/assets/img/**/*.svg`)
    .pipe(svgmin())
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest(buildFolder + '/assets/img'));
});

gulp.task('images', function() {
  return (gulp
      .src(`${srcFolder}/assets/img/**/*.{png,jpg,gif}`, { base: srcFolder })
      // .pipe(
      //   imagemin([
      //     imagemin.optipng({ optimizationLevel: 3 }),
      //     imagemin.jpegtran({ progressive: true }),
      //   ])
      // )
      .pipe(gulp.dest(buildFolder)) );
});

gulp.task('stylelint', function() {
  gulp
    .src([srcFolder + '/styles/**/*.scss', '!' + srcFolder + 'styles/base/normalize.scss'])
    .pipe(postcss([stylelint(), reporter({ clearMessages: true })], { syntax: scss }));
});

gulp.task('style', ['stylelint'], function() {
  gulp
    .src(srcFolder + '/styles/style.scss')
    .pipe(plumber())
    // .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postcss([autoprefixer({ browsers: ['last 1 versions'], cascade: false })]))
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(buildFolder + '/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(buildFolder + '/css'))
    .pipe(browserSync.stream({ match: '**/*.css' }));
});

gulp.task('pug', function() {
  return gulp
    .src(srcFolder + '/pug/pages/*.{pug,jade}')
    .pipe(plumber())
    .pipe(
      data(function() {
        return { data: JSON.parse(fs.readFileSync(srcFolder + '/config/config.json')) };
      })
    )
    .pipe(
      pug({
        pretty: true,
        basedir: srcFolder + '/pug',
      })
    )
    .pipe(gulp.dest(buildFolder));
});

gulp.task('serve', function() {
  browserSync.init({
    server: buildFolder,
    notify: false,
    open: false,
    cors: true,
    ui: false,
  });

  gulp.watch(srcFolder + '/styles/**/*.{scss,sass}', ['style']);
  gulp.watch(srcFolder + '/pug/**/*.{pug,jade}', ['pug']);
  gulp.watch(srcFolder + '/js/**/*.js', ['js']);
  gulp.watch(srcFolder + '/assets/img/*.svg', ['symbols']).on('change', function() {
    browserSync.reload();
  });
  gulp.watch(buildFolder + '/*.html').on('change', function() {
    browserSync.reload();
  });
});

gulp.task('build', function(callback) {
  runSequence('clean', ['copy', 'style', 'pug', 'symbols', 'images'], callback);
});
