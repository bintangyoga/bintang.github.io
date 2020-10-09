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
const spritesmith = require('gulp.spritesmith');
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');
const fonts = require('postcss-font-magician');
const sourcemaps = require('gulp-sourcemaps');
const browsersync = require('browser-sync').create();

// File Path
const files = {
    scssPath: 'src/assets/scss/**/*.scss',
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
        cssnano(),
        fonts({
            foundries: 'bootstrap google',
        }),
    ];
    return gulp
        .src(files.scssPath)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(postcss(plugin))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/assets/css'))
        .pipe(browsersync.stream());
}

function jsTask() {
    return gulp
        .src([
            'node_modules/@popperjs/core/dist/umd/popper.min.js',
            'node_modules/jquery/dist/jquery.slim.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
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

function iconTask() {
    return gulp.src('src/assets/icon/**/*').pipe(gulp.dest('dist/assets/icon'));
}

function imageSprite() {
    var spriteData = gulp.src(files.imgPath).pipe(
        spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprite.scss',
            padding: 10,
        })
    );

    var imgStream = spriteData.img
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest('src/assets/img'));

    var cssStream = spriteData.css.pipe(
        gulp.dest('src/assets/scss/components')
    );

    return merge(imgStream, cssStream);
}

function js() {
    return gulp
        .src('src/assets/js/script.js')
        .pipe(useref())
        .pipe(gulp.dest('dist/assets/js'));
}

function css() {
    return gulp
        .src('src/assets/css/**/*.css')
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

// Default
exports.imageSprite = imageSprite;
exports.default = gulp.series(gulp.parallel(scssTask, jsTask));

// Production
gulp.task('prod', gulp.parallel([css, js, imageTask, fontTask, iconTask, userefTask])
);

// Development
gulp.task('dev', gulp.parallel(watchTask, browserSync, jsTask));