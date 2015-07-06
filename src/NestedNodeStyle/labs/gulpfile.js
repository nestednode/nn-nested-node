var gulp = require('gulp');
var jade = require('gulp-jade');


var src = './**/*.jade';

gulp.task('jade', function() {
    return gulp
        .src(src)
        .pipe(jade())
        .pipe(gulp.dest('./'))
});


gulp.task('watch', function() {
    gulp.watch(src, ['jade']);
});


gulp.task('default', ['jade', 'watch']);
