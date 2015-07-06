var gulp = require('gulp');
var del = require('del');
var merge = require('merge2');
var act = require('gulp-load-plugins')();


gulp.task('clean', function() {
    del('lib/*');
});

gulp.task('ts', function() {
    var result = gulp
        .src('src/**/*.ts')
        .pipe(act.typescript({
            module: 'amd',
            target: 'es5',
            //noImplicitAny: true, //Warn on implied 'any' type
            declarationFiles: true,
            noExternalResolve: false
        //}, undefined, act.typescript.reporter.longReporter()));
        }));
    var dest = 'lib';
    return merge([
        result.dts.pipe(gulp.dest(dest)),
        result.js.pipe(gulp.dest(dest))
    ]);
});

gulp.task('less', function() {
    return gulp
        .src('src/NestedNodeStyle/NestedNodeStyle.less')
        .pipe(act.less())
        .pipe(gulp.dest('src/NestedNodeStyle/'))
        .pipe(gulp.dest('lib/NestedNodeStyle/'))
});

gulp.task('watch', function() {
     gulp.watch(['src/**/*.ts', 'bower_components/**/*.d.ts'], ['ts']);
     gulp.watch('src/NestedNodeStyle/*.less', ['less']);
});


gulp.task('default', ['clean', 'ts', 'less', 'watch']);
