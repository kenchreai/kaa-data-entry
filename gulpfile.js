   var gulp = require('gulp'),
   jsConcat = require('gulp-concat'),
  cssConcat = require('gulp-concat-css'),
       maps = require('gulp-sourcemaps'),
      clean = require('gulp-clean'),
     rename = require('gulp-rename'),
     uglify = require('gulp-uglify'),
  minifyCss = require('gulp-clean-css'),
runSequence = require('run-sequence');

gulp.task('concatCss', function(done) {
  return gulp.src([
    'src/css/normalize.css',
    'src/css/skeleton.css',
    'public/node_modules/awesomplete/awesomplete.css',
    'public/node_modules/vex-js/css/vex.css',
    'public/node_modules/vex-js/css/vex-theme-os.css',
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
    'src/js/authService.js',
    'src/js/validator.js',
    'src/js/register.js',
    'src/js/login.js',
    'src/js/utils.js',
    'src/js/detail.js',
    'src/js/main.js',
    'src/js/changePassword.js',
    'src/js/router.js'])
    .pipe(jsConcat('src.js'))
    .pipe(gulp.dest('src/js'));
});

gulp.task('minifyScripts', function(done) {
  runSequence('concatSourceScripts', function() {
    gulp.src('src/js/src.js')
      .pipe(uglify())
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
      'public/node_modules/toastr/package/build/toastr.min.js',
      'public/node_modules/vex-js/dist/vex.combined.min.js',
      'src/js/src.min.js'])
      .pipe(jsConcat('app.min.js'))
      .pipe(gulp.dest('public/js/'));
    done();
  });
});

gulp.task('concatDev', function() {
  return gulp.src([
    'public/node_modules/jquery/dist/jquery.min.js',
    'public/node_modules/spin/dist/spin.min.js',
    'public/node_modules/awesomplete/awesomplete.min.js',
    'public/node_modules/toastr/package/build/toastr.min.js',
    'public/node_modules/vex-js/dist/vex.combined.min.js',
    'src/js/dbService.js',
    'src/js/spinnerService.js',
    'src/js/urlService.js',
    'src/js/typeService.js',
    'src/js/authService.js',
    'src/js/validator.js',
    'src/js/register.js',
    'src/js/login.js',
    'src/js/utils.js',
    'src/js/detail.js',
    'src/js/changePassword.js',
    'src/js/main.js',
    'src/js/router.js'
    ])
    .pipe(maps.init())
    .pipe(jsConcat('app.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('watchFiles', function() {
  gulp.watch(['src/css/*.css'], ['minifyCss']);
  gulp.watch(['src/js/*.js'], ['concatDev']);
});

gulp.task('clean', function() {
  return gulp.src(['src/js/src.js', 'src/js/src.min.js', 'src/js/*.map',
                   'public/css/*.css', 'public/js/*.js', 'public/js/*.map'],
                   { read: false })
    .pipe(clean());
});

gulp.task('serve', function(done) {
  runSequence('build', 'concatDev', 'watchFiles', function() {
    done();
  });
});

gulp.task('build', function(done) {
  runSequence(
    'clean',
    'concatSourceScripts',
    'minifyScripts',
    'concatMinifiedScripts',
    'minifyCss',
    function() {
      done();
    });
});

gulp.task('default', ['serve']);
