   var gulp = require('gulp'),
   jsConcat = require('gulp-concat'),
  cssConcat = require('gulp-concat-css'),
       maps = require('gulp-sourcemaps'),
      clean = require('gulp-clean'),
     rename = require('gulp-rename'),
     uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css'),
runSequence = require('run-sequence');

gulp.task('concatCss', function(done) {
  return gulp.src([
    'src/css/normalize.css',
    'src/css/skeleton.css',
    'public/node_modules/awesomplete/awesomplete.css',
    'src/css/custom.css'])
    .pipe(maps.init())
    .pipe(cssConcat('styles.css'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('public/css/'));
});

gulp.task('minifyCss', function(done) {
  runSequence('concatCss', function() {
    gulp.src('public/css/styles.css')
      .pipe(maps.init())
      .pipe(minifyCss())
      .pipe(maps.write())
      .pipe(rename('styles.min.css'))
      .pipe(gulp.dest('public/css/'));
    done();
  });
});

gulp.task('concatSourceScripts', function() {
  return gulp.src([
    'src/js/dbService.js',
    'src/js/spinnerService.js',
    'src/js/urlService.js',
    'src/js/typeService.js',
    'src/js/validator.js',
    'src/js/utils.js',
    'src/js/detail.js',
    'src/js/main.js',
    'src/js/router.js'])
    .pipe(maps.init())
    .pipe(jsConcat('src.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('src/js'));
});

gulp.task('minifyScripts', function(done) {
  runSequence('concatSourceScripts', function() {
    gulp.src('src/js/src.js')
      .pipe(maps.init())
      .pipe(uglify())
      .pipe(maps.write())
      .pipe(rename('src.min.js'))
      .pipe(gulp.dest('src/js'));
    done();
  });
});

gulp.task('concatMinifiedScripts', function(done) {
  runSequence('minifyScripts', function() {
    gulp.src([
      'public/node_modules/jquery/dist/jquery.min.js',
      'public/node_modules/spin/dist/spin.min.js',
      'public/node_modules/awesomplete/awesomplete.min.js',
      'src/js/src.min.js'])
      .pipe(maps.init())
      .pipe(jsConcat('app.min.js'))
      .pipe(maps.write('./'))
      .pipe(gulp.dest('public/js/'));
  });
});

gulp.task('watchFiles', function() {
  gulp.watch(['src/styles/sass/*.scss', 'src/styles/sass/partials/*.scss'], ['minifyCss']);
  gulp.watch(['src/js/app/**/*.js'], ['concatScripts', 'concatMinifiedScripts']);
});

gulp.task('clean', function() {
  return gulp.src(['src/js/src.js', 'src/js/src.min.js', 'src/js/*.map',
                   'public/css/*.css', 'public/js/*.js', 'public/js/*.map'],
                   { read: false })
    .pipe(clean());
});

gulp.task('serve', function(done) {
  runSequence('build', 'watchFiles', function() {
    done();
  });
});

gulp.task('build', function(done) {

  runSequence(
    'clean',
    'minifyScripts',
    'minifyCss',
    function() {
      done();
    });
});

gulp.task('default', ['serve']);
