/**
 * Created by xD3VHAX on 03/02/2017.
 */
var gulp = require('gulp');
var csscomb = require('gulp-csscomb');
const autoprefixer = require('gulp-autoprefixer');
var gutil = require('gulp-util');
const changed = require('gulp-changed');
useref = require('gulp-useref'),


gulp.task('optimize', function() {
    return gulp.src('./dev/css**/*.css')
        .pipe(autoprefixer([
            'Android 2.3',
            'Android >= 4',
            'Chrome >= 20',
            'Firefox >= 24', // Firefox 24 is the latest ESR
            'Explorer >= 8',
            'iOS >= 6',
            'Opera >= 12',
            'Safari >= 6']))
        .pipe(csscomb())
        .pipe(gulp.dest("./dev/"));
});



gulp.task('minify', function() {
    return gulp.src('./views/dev/**/*.ejs')
        .pipe(useref())
        .pipe(gulp.dest('./views/public/'));
});



/*
gulp.task('styles', function() {
    return gulp.src('./dev/css/*.css')
        .pipe(autoprefixer([
            'Android 2.3',
            'Android >= 4',
            'Chrome >= 20',
            'Firefox >= 24', // Firefox 24 is the latest ESR
            'Explorer >= 8',
            'iOS >= 6',
            'Opera >= 12',
            'Safari >= 6']))
        .pipe(csscomb())
        .pipe(gulp.dest('./publictest/css'));
});*/