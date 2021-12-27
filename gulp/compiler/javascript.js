// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.install = [
]


exports.build = (compiler) => {
}


exports.dev = (gulp, compiler, bs) => {
    function compile_js(done) {
        gulp.src(`${source}/**/*.js`, {sourcemaps: true})
            .pipe(gulp.rename({ extname: '.min.js' }))
            .pipe(gulp.dest(target, { sourcemaps: '.' }))
            .pipe(bs.stream())
        done()
    }
    const source = compiler.source || 'src/js'
    const target = compiler.target || 'dev/static/js'
    return gulp.watch([`${source}/**/*.js`],
        {
            ignoreInitial: false,
            usePolling: true,
        },
        compile_js
    )
}
