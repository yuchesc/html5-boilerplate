"use strict";

const gulp = require('gulp');
const pump = require('pump');
const browserSync = require('browser-sync');
const del = require('del');
const gulpStylus = require('gulp-stylus');
const gulpEjs = require('gulp-ejs');
const gulpEslint = require('gulp-eslint');

// minify
const gulpMinifyHtml = require('gulp-minify-html');
const gulpCleanCss = require('gulp-clean-css');
// uglify for ES6
const uglifyEs = require('uglify-es');
const composer = require('gulp-uglify/composer');
const uglify = composer(uglifyEs, console);

// base source directory
const src = 'src';

function toSrc(target) {
    return `${src}/${target}`;
}
const path = {
    //src: path.relative('.', 'src'),
    output: '_build',
    deps: [
        'node_modules/axios/dist/axios.min.js',
        'node_modules/vue/dist/vue.min.js',
        'node_modules/luxon/build/global/luxon.min.js'
    ],
    resources: [
        toSrc('robots.txt'),
        toSrc('favicon.ico'),
        toSrc('assets/img/*.*'),
        toSrc('assets/vendor/*.*')
    ],
    html: [toSrc('*.html')],
    htmlWatch: [toSrc('*.html'), toSrc('assets/ejs/*.ejs')],
    script: toSrc('assets/script/*.js'),
    styleWatch: toSrc('assets/style/*.styl'),
    style: toSrc('assets/style/[^_]*.styl')
};


function clean() {
    return del([path.output]);
}

function browser(done) {
    browserSync.init({
        server: {
            baseDir: path.output
        },
        port: 3000
    });
    done();
}

function reloadBrowser(done) {
    browserSync.reload();
    done();
}

function copyDeps() {
    return gulp.src(path.deps)
        .pipe(gulp.dest(`${path.output}/assets/vendor/`));
}

function copyResources() {
    return gulp.src(path.resources, { base: src })
        .pipe(gulp.dest(path.output));
}

function html() {
    return gulp.src(path.html, { base: src})
        .pipe(gulpEjs())
        .pipe(gulpMinifyHtml({empty: true}))
        .pipe(gulp.dest(path.output));
}

function script(done) {
    pump([
            gulp.src(path.script, { base: src }),
            gulpEslint(),
            gulpEslint.format(),
            gulpEslint.failAfterError(),
            uglify(),
            gulp.dest(path.output)
        ],
        done);
}

function style() {
    return gulp.src(path.style, { base: src })
        .pipe(gulpStylus())
        .pipe(gulpCleanCss({compatibility: 'ie8'}))
        .pipe(gulp.dest(path.output));
}

function watchFiles() {
    gulp.watch(path.htmlWatch, gulp.series(style, html, reloadBrowser));
    gulp.watch(path.script, gulp.series(script, reloadBrowser));
    gulp.watch(path.styleWatch, gulp.series(style, html, reloadBrowser));
    gulp.watch(path.resources, gulp.series(copyResources, reloadBrowser));
}


const build = gulp.series(clean, gulp.parallel(html, script, style, copyDeps, copyResources));
const watch = gulp.series(build, gulp.parallel(browser, watchFiles));

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;