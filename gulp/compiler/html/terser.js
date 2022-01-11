// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.dependencies = [
    'gulp-html-minifier-terser'
]


exports.build = (gulp, compiler) => {
    function compile_html_terser() {
        return gulp.src(`${source}/**/*.html`)
            .pipe(minify(cfg))
            .pipe(gulp.dest(target))
    }
    const source = 'src/' + (compiler.source || 'html')
    const target = 'build/' + (compiler.target || '')
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
    return compile_html_terser
}


exports.dev = (gulp, compiler, bs) => {
    function compile_html_terser() {
        return gulp.src(`${source}/**/*.html`, { since: gulp.lastRun(compile_html_terser)})
            .pipe(gulp.dest(target))
    }
    const source = 'src/' + (compiler.source || 'html')
    const target = 'dev/' + (compiler.target || '')
    return gulp.watch([`${source}/**/*.html`],
        {
            ignoreInitial: false,
            usePolling: true,
        },
        compile_html_terser
    ).on('change', bs.reload)
}
