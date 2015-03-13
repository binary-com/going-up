var gulp = require("gulp");
var babel = require("gulp-babel");


var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");


gulp.task("default", function() {

    browserify({
            debug: true
        })
        .transform(babelify)
        .require("js/app2.js", {
            entry: true
        })
        .bundle()
        .on("error", function(err) {
            console.log("Error: " + err.message);
        })
        .pipe(fs.createWriteStream("bundle.js"));
});
