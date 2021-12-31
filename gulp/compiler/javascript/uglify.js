// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.dependencies = [
    'gulp-uglify'
]


exports.build = (gulp, compiler, target_root) => {
    function compile_js(done) {
        gulp.src(`${source}/**/*.js`, { sourcemaps: false })
            .pipe(gulp.rename({ extname: '.min.js' }))
            .pipe(minify(cfg))
            .pipe(gulp.dest(target))
        done()
    }
    const source = 'src/' + (compiler.source || 'js')
    const target = target_root + (compiler.target || 'static/js')
    const minify = require('gulp-uglify')
    const cfg = gulp.mergeOptions(
        compiler.config?.all || {},
        compiler.config?.dev || {}
    )
    return compile_js
}


exports.dev = (gulp, compiler, bs, target_root) => {
    function compile_js(done) {
        gulp.src(`${source}/**/*.js`, {sourcemaps: true})
            .pipe(gulp.rename({ extname: '.min.js' }))
            .pipe(gulp.dest(target, { sourcemaps: '.' }))
            .pipe(bs.stream())
        done()
    }
    const source = 'src/' + (compiler.source || 'js')
    const target = target_root + (compiler.target || 'static/js')
    return gulp.watch([`${source}/**/*.js`],
        {
            ignoreInitial: false,
            usePolling: true,
        },
        compile_js
    )
}
