// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.dependencies = [
    'gulp-clean-css'
]


exports.build = (gulp, compiler) => {
    function compile_clean_css() {
        return gulp.src(`${source}/**/*.css`, { sourcemaps: false })
            .pipe(gulp.rename({ extname: '.min.css' }))
            .pipe(minify(cfg))
            .pipe(gulp.dest(target, { sourcemaps: '.' }))
    }
    const source = 'src/' + (compiler.source || '/css')
    const target = 'build/' + (compiler.target || 'static/css')
    const minify = require('gulp-clean-css')
    const cfg = gulp.mergeOptions(
        {
            level: 2,
        },
        compiler.config?.all || {},
        compiler.config?.build || {}
    )
    return compile_clean_css
}


exports.dev = (gulp, compiler, bs) => {
    function compile_clean_css() {
        return gulp.src(`${source}/**/*.css`, { sourcemaps: true, since: gulp.lastRun(compile_clean_css) })
            .pipe(gulp.rename({ extname: '.min.css' }))
            .pipe(gulp.dest(target, { sourcemaps: '.' }))
            .pipe(bs.stream())
        // done()
    }
    const source = 'src/' + (compiler.source || 'css')
    const target = 'dev/' + (compiler.target || 'static/css')
    return gulp.watch([`${source}/**/*.css`],
        {
            ignoreInitial: false,
            usePolling: true,
        },
        compile_clean_css
    )
}
