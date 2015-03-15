var gulp = require('gulp');
var browserify = require('browserify');
var through2 = require('through2');
var babelify = require('babelify');
var rename = require('gulp-rename');
var sourcemaps = require("gulp-sourcemaps");

gulp.task('default', function() {
    return gulp.src('./js/app2.js')
        .pipe(sourcemaps.init())
        .pipe(through2.obj(function(file, enc, next) {
            browserify(file.path, {
                    debug: process.env.NODE_ENV === 'development'
                })
                .transform(babelify)
                .bundle(function(err, res) {
                    if (err) return next(err);

                    file.contents = res;
                    next(null, file);
                });
        }))
        .on('error', function(error) {
            console.log(error.stack);
            this.emit('end');
        })
        .pipe(rename('bundle.js'))
        .pipe(sourcemaps.write("."))        
        .pipe(gulp.dest('./dist'));
});
