// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.dependencies = [
    'gulp-uglify'
]


exports.build = (gulp, compiler) => {
    function compile_js_uglify() {
        return gulp.src(`${source}/**/*.js`, { sourcemaps: false })
            .pipe(gulp.rename({ extname: '.min.js' }))
            .pipe(minify(cfg))
            .pipe(gulp.dest(target))
    }
    const source = 'src/' + (compiler.source || 'js')
    const target = 'build/' + (compiler.target || 'static/js')
    const minify = require('gulp-uglify')
    const cfg = gulp.mergeOptions(
        compiler.config?.all || {},
        compiler.config?.dev || {}
    )
    return compile_js_uglify
}


exports.dev = (gulp, compiler, bs) => {
    function compile_js_uglify() {
        return gulp.src(`${source}/**/*.js`, { sourcemaps: true, since: gulp.lastRun(compile_js_uglify) })
            .pipe(gulp.rename({ extname: '.min.js' }))
            .pipe(gulp.dest(target, { sourcemaps: '.' }))
            .pipe(bs.stream())
    }
    const source = 'src/' + (compiler.source || 'js')
    const target = 'dev/' + (compiler.target || 'static/js')
    return gulp.watch([`${source}/**/*.js`],
        {
            ignoreInitial: false,
            usePolling: true,
        },
        compile_js_uglify
    )
}
