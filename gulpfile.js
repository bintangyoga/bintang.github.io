'use-strict';

const gulp = require('gulp');
const autoprefixer = require('autoprefixer');
const sass = require('gulp-sass');
const postsvg = require('postcss-inline-svg');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const useref = require('gulp-useref');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const merge = require('merge-stream');
const fonts = require('postcss-font-magician');
const sourcemaps = require('gulp-sourcemaps');
const browsersync = require('browser-sync').create();
const del = require('del');
const purgecss = require('gulp-purgecss');

// File Path
const files = {
    scssPath: 'src/assets/scss/**/*.scss',
    cssPath: 'src/assets/css/vendors/*.css',
    jsPath: 'src/assets/js/**/*.js',
    imgPath: 'src/assets/img/**/*',
};

function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: './src',
        },
        port: 3000,
    });
    done();
}

function browserSyncReload(done) {
    browsersync.reload();
    done();
}

function scssTask() {
    const plugin = [
        autoprefixer(),
        postsvg(),
        postsvg(),
        cssnano(),
        fonts({
            foundries: 'bootstrap google',
        }),
    ];

    var sassStream,
        cssStream;

    sassStream = gulp.src(files.scssPath)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(postcss(plugin))
        .pipe(sourcemaps.write())

    cssStream = gulp.src([
        // 'node_modules/minibarjs/dist/minibar.min.css',
        // 'node_modules/@splidejs/splide/dist/css/splide.min.css',
    ]);

    return merge(sassStream, cssStream)
        .pipe(concat('style.css'))
        .pipe(gulp.dest('src/assets/css'))
        .pipe(browsersync.stream());
}


function jsTask() {
    return gulp
        .src([
            'node_modules/@popperjs/core/dist/umd/popper.min.js',
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            // 'node_modules/minibarjs/dist/minibar.min.js',
            // 'node_modules/@splidejs/splide/dist/js/splide.min.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(sourcemaps.write())
        .pipe(uglify())
        .pipe(gulp.dest('src/assets/js'));
}

function imageTask() {
    return gulp
        .src(files.imgPath)
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/img'));
}

function fontTask() {
    return gulp
        .src('src/assets/fonts/**/*')
        .pipe(gulp.dest('dist/assets/fonts'));
}

function js() {
    return gulp
        .src('src/assets/js/script.js')
        .pipe(useref())
        .pipe(gulp.dest('dist/assets/js'));
}

function css() {
    return gulp
        .src('src/assets/css/style.css')
        .pipe(useref())
        .pipe(gulp.dest('dist/assets/css'));
}

function userefTask() {
    return gulp.src('src/*.html').pipe(useref()).pipe(gulp.dest('dist'));
}

function watchTask() {
    gulp.watch(files.scssPath, scssTask);
    gulp.watch('src/*.html', browserSyncReload);
}

function cleanDist(resolve) {
    del.sync('dist');
    resolve();
}

function cleanCSS() {
    return gulp
    .src('src/**/*.css')
    .pipe( 
      purgecss({
        content: ['src/**/*.html']
      })
    )
    .pipe(gulp.dest('dist/'))
}

// On Save
exports.default = gulp.series(gulp.parallel(scssTask, jsTask));

// Production
gulp.task('prod', gulp.parallel([cleanDist, css, js, imageTask, fontTask, userefTask]));

// Development
gulp.task('dev', gulp.parallel(watchTask, browserSync, jsTask));
