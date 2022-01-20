// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.dependencies = [
    'gulp-imagemin@7.1.0'   // We pin to 7.1.0 because 8.x is ESM, and doesn't work here.
]

const extensions = '*.{jpg,jpeg,png,svg}'

exports.build = (gulp, compiler) => {
    function compile_imagemin() {
        return gulp.src(`${source}/**/${extensions}`)
            .pipe(imagemin(cfg))
            .pipe(gulp.dest(target))
    }
    const source = 'src/' + (compiler.source || 'image')
    const target = 'build/' + (compiler.target || 'static/image')
    const imagemin = require('gulp-imagemin')
    const cfg = {}
    return compile_imagemin
}


exports.dev = (gulp, compiler, bs) => {
    function compile_imagemin() {
        return gulp.src(`${source}/**/${extensions}`, { since: gulp.lastRun(compile_imagemin)})
            .pipe(imagemin(cfg))
            .pipe(gulp.dest(target))
    }
    const source = 'src/' + (compiler.source || 'image')
    const target = 'dev/' + (compiler.target || 'static/image')
    const imagemin = require('gulp-imagemin')
    const cfg = {}
    return gulp.watch([`${source}/**/*`],
        {
            ignoreInitial: false,
            usePolling: true,
        },
        compile_imagemin
    )
}
