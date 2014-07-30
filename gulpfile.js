var gulp = require('gulp')
var sass = require('gulp-sass')
var prefix = require('gulp-autoprefixer')
var concat = require('gulp-concat')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var clean = require('gulp-clean')
var connect = require('gulp-connect')

// server --------------------------------- //

var port = 3000

gulp.task('serve', function() {
  connect.server({
    root: './build',
    port: port,
    livereload: true
  })
})

// main tasks ------------------------------ //

gulp.task('styles', function(){
  gulp.src('./app/application.scss')
    .pipe(sass())
    .pipe(prefix())
    .pipe(gulp.dest('./build/assets/css/'))
    .pipe(connect.reload());
});

gulp.task('scripts', function(){
  var bundler = browserify('./app/application.js')
  bundle(bundler, './application.js')
    .pipe(gulp.dest('./build/assets/js/'))
    .pipe(connect.reload());
});

gulp.task('loader', function(){
  var bundler = browserify('./app/loader/nope.js')
  bundle(bundler, './nope.js')
    .pipe(gulp.dest('./build/assets/js/'));

  var bundler = browserify('./app/loader/index.js')
  bundle(bundler, './loader.js')
    .pipe(gulp.dest('./build/assets/js/'))
    .pipe(connect.reload());
});

gulp.task('html', function(){
  gulp.src('./app/index.html')
    .pipe(gulp.dest('./build/'))
    .pipe(connect.reload());
});

gulp.task('clean-assets', function(){
  return gulp.src('./build/assets/', {read: false})
    .pipe(clean())
});

gulp.task('assets', ['clean-assets'], function(){
  gulp.src('./app/assets/**/*')
    .pipe(gulp.dest('./build/assets/'))
    .pipe(connect.reload());
});

gulp.task('tests', function(){
  // var bundler = browserify()
  // glob.sync("./app/@(widgets|lib)/*/test/*").forEach(function(file){
  //   bundler.add(file)
  // })
  // bundle(bundler, './index.js')
  //   .pipe(gulp.dest('./build/assets/js/tests/'));
});

function bundle(bundler, outFilename){
  bundler = bundler.transform('ractify')
  if(process.env.NODE_ENV === "production") {
    bundler = bundler.transform({global: true}, 'uglifyify')
  }

  return bundler.bundle()
    .on('error', function (err) {
      console.error('Browserify Error')
      console.error(err.message);
      console.error(err.stack)
      this.emit("end");
    })
    .pipe(source(outFilename))
}

// watch ---------------------------------- //

gulp.task('watch', function() {

  gulp.watch(['app/**/*.scss'], ['styles']);
  gulp.watch(['app/**/*.js', 'app/**/*.json', 'app/**/*.ract', '!app/**/node_modules/**/*'/*, '!app/loader/**'*/], ['scripts'/*, 'tests'*/]);
  // gulp.watch(['app/loader/**.js'], ['loader', 'tests']);
  gulp.watch('app/assets/**/*', ['assets']);
  gulp.watch('app/index.html', ['html']);
  gulp.watch(['app/**/test/*.js', '!app/**/node_modules/**/*']/*, ['tests']*/);

});

// $ gulp sketch  ------------------------- //
/*
gulp.task('sketch', function() {
  gulp.src('./app/assets-master.sketch')
    .pipe(sketch({
      export: 'artboards'
    }))
    .pipe(gulp.dest('./app/assets/img/'));
});
*/
// $ gulp build --------------------------- //

gulp.task('build', ['html', /*'loader', */'scripts', 'styles', 'assets']);

// $ gulp ---------------------------------- //

gulp.task('default', [/*'loader', */'scripts', 'styles', 'html', 'assets', /*'tests', */'serve', 'watch']);

