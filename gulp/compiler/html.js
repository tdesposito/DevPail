// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.install = [
]


exports.build = (compiler) => {
}


exports.dev = (gulp, compiler, bs) => {
    function compile_html(done) {
        gulp.src(`${source}/**/*.html`)
            .pipe(gulp.dest(target))
        done()
    }
    const source = compiler.source || 'src/html'
    const target = compiler.target || 'dev/'
    return gulp.watch([`${source}/**/*.html`],
        {
            ignoreInitial: false,
            usePolling: true,
        },
        compile_html
    ).on('change', bs.reload)
}
