// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.dependencies = [
    "gulp-clean-css"
]


exports.build = (gulp, compiler) => {
    function compile_css(done) {
        gulp.src(`${source}/**/*.css`, { sourcemaps: false })
            .pipe(gulp.rename({ extname: '.min.css' }))
            .pipe(minify(cfg))
            .pipe(gulp.dest(target, { sourcemaps: '.' }))
        done()
    }
    const source = compiler.source || 'src/css'
    const target = compiler.target || 'build/static/css'
    const minify = require('gulp-clean-css')
    const cfg = gulp.mergeOptions(
        {
            level: 2,
        },
        compiler.config?.all || {},
        compiler.config?.build || {}
    )
    return compile_css
}


exports.dev = (gulp, compiler, bs) => {
    function compile_css(done) {
        gulp.src(`${source}/**/*.css`, {sourcemaps: true})
            .pipe(gulp.rename({ extname: '.min.css' }))
            .pipe(gulp.dest(target, { sourcemaps: '.' }))
            .pipe(bs.stream())
        done()
    }
    const source = compiler.source || 'src/css'
    const target = compiler.target || 'dev/static/css'
    return gulp.watch([`${source}/**/*.css`],
        {
            ignoreInitial: false,
            usePolling: true,
        },
        compile_css
    )
}
