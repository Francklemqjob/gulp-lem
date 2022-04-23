const gulp        = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass')(require('sass'));
const rename = require("gulp-rename");
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const webpack = require("webpack-stream");
const BrowserSyncPlugin  =  require ('browser-sync-webpack-plugin');
const imagemin = require('gulp-imagemin');
const zip = require('gulp-zip');

const dist = "dist/";
// const dist = "./../dist/";
gulp.task('styles', function() {
    return gulp.src("src/assets/scss/**/*.+(scss|sass)")
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(rename({
                prefix: "",
                suffix: ".min"
            }))
            .pipe(autoprefixer())
            .pipe(gulp.dest('dist/assets/css'))
            .pipe(cleanCSS({compatibility: 'ie8'}))
            .pipe(gulp.dest("src/assets/css"))

            .pipe(browserSync.stream());
});

gulp.task('watch', function() {
    browserSync({
        server: "./dist/",
        port: 4000,
        notify: true
    });
    gulp.watch("src/assets/scss/**/*.+(scss|sass)", gulp.parallel("styles"));
    gulp.watch("src/*.html", gulp.parallel("copy-html"));
    gulp.watch("src/assets/**/*.*", gulp.parallel("copy-assets"));
    gulp.watch("src/js/**/*.js", gulp.parallel("build-js"));
});

gulp.task("copy-html", () => {
    return gulp.src("src/*.html")
                .pipe(gulp.dest(dist))
                .pipe(browserSync.stream());
});
gulp.task("build-js", () => {
    return gulp.src("src/js/main.js")
                .pipe(webpack({
                    mode: 'development',
                    output: {
                        filename: 'script.js'
                    },
                    watch: false,
                    devtool: "source-map",
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                              }
                            }
                          }
                        ]
                      }
                }))
                
                .pipe(gulp.dest(dist +"/js/"))
                .on("end", browserSync.reload);
});
gulp.task("build-prod-js", () => {
    return gulp.src("src/js/main.js")
                .pipe(webpack({
                    mode: 'production',
                    output: {
                        filename: 'script.js'
                    },
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                              }
                            }
                          }
                        ]
                      }
                }))
                .pipe(gulp.dest(dist +"/js/"));
});
gulp.task("copy-assets", () => {
    return gulp.src("src/assets/**/*.*", {ignore: "./src/assets/scss/**/*.*"})
                .pipe(gulp.dest(dist + "/assets/"))
                .on("end", browserSync.reload);
});
gulp.task("zip-dist", () => {
    return gulp.src('dist/**/*')
        .pipe(zip('archive-dist.zip'))
        .pipe(gulp.dest('./'));
});
gulp.task("zip", () => {
    return gulp.src('./**/**.*', {ignore: "./node_modules/**/*.*"})
        .pipe(zip('archive-all.zip'))
        .pipe(gulp.dest('./'));
});
gulp.task('imagemin', function() {
  return gulp.src('src/assets/**/*.*', {ignore: "./src/assets/scss/**/*.*"})
      .pipe(imagemin({
          progressive: true,
          optimizationLevel: 5
          }))
      .pipe(gulp.dest('dist/assets/'));
});



gulp.task('final', gulp.parallel("imagemin", "build-prod-js"));

gulp.task('zip', gulp.parallel("zip-dist", "zip"));

gulp.task("build", gulp.parallel("copy-html", "copy-assets", "build-js"));

gulp.task('default', gulp.parallel('watch', 'styles' , "build"));