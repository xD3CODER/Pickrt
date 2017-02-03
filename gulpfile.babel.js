/**
 * Created by xD3VHAX on 03/02/2017.
 */
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var $ = gulpLoadPlugins();
const del = require('del');
var csscomb = require('gulp-csscomb');
var gutil = require('gulp-util');
var useref = require('gulp-useref');
var changed = require('gulp-changed');


gulp.task('optimize', function () {
    return gulp.src('./dev/css**/*.css')
        .pipe($.autoprefixer([
            'Android 2.3',
            'Android >= 4',
            'Chrome >= 20',
            'Firefox >= 24', // Firefox 24 is the latest ESR
            'Explorer >= 8',
            'iOS >= 6',
            'Opera >= 12',
            'Safari >= 6']))
        .pipe($.csscomb())
        .pipe(gulp.dest("./dev/"));
});

gulp.task('updateStatics', () =>
     new Promise(function (resolve, reject) {
        del(['public/**'])
            .then(function(){
            gulp.src('dev/images/**')
                .pipe(gulp.dest('public/images'));
            console.log('Images duplicate');

            })
            .then(function(){
                gulp.src('dev/languages/**')
                    .pipe(gulp.dest('public/languages'));
                console.log('Languages duplicate');
                resolve();
            })
            .catch(e => {
                reject();
            });
    })
);

gulp.task('clean', function () {
    return new Promise(function (resolve, reject) {
        gulp.src(['public/css/**', 'views/public/**'], {read: false})
            .pipe($.clean());
        resolve();
    });
});


gulp.task('combine', function (done) {
    gulp.src('./views/dev/**/*.ejs')
        .pipe(useref())
        .pipe(gulp.dest('./views/public/'));
    done();
});

gulp.task('minify', gulp.series('clean', 'combine', function (done) {
    // do more stuff
    console.log('Minifying done');
    done();
}));
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