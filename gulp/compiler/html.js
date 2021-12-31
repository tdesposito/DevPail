// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.dependencies = [
    'gulp-html-minifier-terser'
]


exports.build = (gulp, compiler, target_root) => {
    function compile_html(done) {
        gulp.src(`${source}/**/*.html`)
            .pipe(minify(cfg))
            .pipe(gulp.dest(target))
        done()
    }
    const source = 'src/' + (compiler.source || 'html')
    const target = target_root + (compiler.target || '')
    const minify = require('gulp-html-minifier-terser')
    const cfg = gulp.mergeOptions(
        {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
        },
        compiler.config?.all || {},
        compiler.config?.build || {}
    )
    return compile_html
}


exports.dev = (gulp, compiler, bs, target_root) => {
    function compile_html(done) {
        gulp.src(`${source}/**/*.html`)
            .pipe(gulp.dest(target))
        done()
    }
    const source = 'src/' + (compiler.source || 'html')
    const target = target_root + (compiler.target || '')
    return gulp.watch([`${source}/**/*.html`],
        {
            ignoreInitial: false,
            usePolling: true,
        },
        compile_html
    ).on('change', bs.reload)
}
