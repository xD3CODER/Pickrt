/**
 * Created by xD3VHAX on 03/02/2017.
 */
var gulp = require("gulp");
var gulpLoadPlugins = require("gulp-load-plugins");
var $ = gulpLoadPlugins();
const del = require("del");
var csscomb = require("gulp-csscomb");
var gutil = require("gulp-util");
var useref = require("gulp-useref");
var changed = require("gulp-changed");
var gs = require("gulp-selectors");
var closureCompiler = require("google-closure-compiler").gulp();


gulp.task("optimize", function () {
    return gulp.src("./dev/css**/*.css")
        .pipe($.autoprefixer([
            "Android 2.3",
            "Android >= 4",
            "Chrome >= 20",
            "Firefox >= 24", // Firefox 24 is the latest ESR
            "Explorer >= 8",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6"]))
        .pipe($.csscomb())
        .pipe(gulp.dest("./dev/"));
});

gulp.task("statics", () =>
    new Promise(function (resolve, reject) {
        del(["public/images/**", "public/languages/**"])
            .then(function () {
                gulp.src("dev/images/**")
                    .pipe(gulp.dest("public/images"));
                console.log("Images duplicate");

            })
            .then(function () {
                gulp.src("dev/js/**")
                    .pipe(gulp.dest("public/js"));
                console.log("js duplicate");

            })
            .then(function () {
                gulp.src("dev/vendor/**")
                    .pipe(gulp.dest("public/vendor"));
                console.log("vendor duplicate");

            })
            .then(function () {
                gulp.src("dev/vendor/font-awesome/fonts/**")
                    .pipe(gulp.dest("public/fonts"));
                console.log("fonts duplicate");

            })
            .then(function () {
                gulp.src("dev/vendor/bootstrap/fonts/**")
                    .pipe(gulp.dest("public/fonts"));
                console.log("fonts duplicate");

            })
            .then(function () {
                gulp.src("dev/languages/**")
                    .pipe(gulp.dest("public/languages"));
                console.log("Languages duplicate");
                resolve();
            })
            .catch(function () {
                reject();
            });
    })
);

gulp.task("delete_statics", () =>
    new Promise(function (resolve, reject) {
        del(["public/**", "public/languages/**", "views/public/**"])
            .then(function () {
                console.log("Public folders removed");
                resolve();
            })
            .catch(function () {
                reject();
            });
    })
);

gulp.task("muncher", () => {
    return gulp.src(["./public/css/combined-custom.css", "./views/public/**/*.ejs", "./public/js/**/*.js"])
        .pipe(gs.run({
            "css": ["scss", "css"],
            "html": ["ejs"],
            "js-strings": ["js"]
        }, {
            classes: ["hidden", "required", "open"],   // ignore these class selectors,
            ids: ["hidden", "required", "open"]                     // ignore all IDs
        }))
        .pipe(gulp.dest("./public/yolo/"));
});


gulp.task("mini", () => {
    return gulp.src(["public/js/combined.js"])
        .pipe($.babel())
        .pipe($.uglify())
        .pipe(gulp.dest("./public/yolo/98"));
});


gulp.task("clean", function () {
    return new Promise(function (resolve, reject) {
        gulp.src(["public/**", "views/public/**"], {read: false})
            .pipe($.clean());
        resolve();
    });
});


gulp.task("combine", () =>
    new Promise(function (resolve, reject) {
        del(["public/css/**", "public/js/**", "views/public/**"])
            .then(function () {
                gulp.src("./views/dev/**/*.ejs")
                    .pipe($.useref())
                    .pipe($.replace("../../public", ""))
                    .pipe(gulp.dest("./views/public/"));
                console.log("Css & JS combined !");
                resolve();
            })

            .catch(function () {
                reject();
            });
    })
);

gulp.task("minify", gulp.series("clean", "combine", function (done) {
    console.log("Minifying done");
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