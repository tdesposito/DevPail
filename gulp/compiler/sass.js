// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.install = [
  'gulp-sass',
  'sass',
]


exports.build = (compiler) => {
}


exports.dev = (gulp, compiler, bs) => {
  function compile_sass(done) {
      gulp.src([`${source}/*.scss`, `${source}/*.sass`], { sourcemaps: true })
        .pipe(sass(cfg).on('error', sass.logError))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(target, { sourcemaps: '.' }))
        .pipe(bs.stream())
      done()
    }
  const sass = require('gulp-sass')(require('sass'))
  const rename = require('gulp-rename')

  const source = compiler.source || 'src/sass'
  const target = compiler.target || 'dev/static/css'
  const cfg = {
    ...(compiler?.config?.all || {}),
    ...(compiler?.config?.development || {})
  }
  return gulp.watch(
    [`${source}/**/*.scss`, `${source}/**/*.sass`],
    {
      ignoreInitial: false,
      usePolling: true,
    },
    compile_sass
  )
}
