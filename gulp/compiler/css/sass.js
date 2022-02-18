// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [
  'gulp-sass',
  'sass',
]


exports.build = (gulp, compiler) => {
  function compile_sass() {
    return gulp.src(`${source}/*.{scss,sass}`, { sourcemaps: false })
      .pipe(sass(cfg).on('error', sass.logError))
      .pipe(gulp.rename({ extname: '.min.css' }))
      .pipe(gulp.dest(target))
  }
  const sass = require('gulp-sass')(require('sass'))

  const source = 'src/' + (compiler.source || 'sass')
  const target = 'build/' + (compiler.target || 'static/css')
  const cfg = gulp.mergeOptions(
    {
      outputStyle: 'compressed',
      sourceComments: false,
    },
    compiler.config?.all || {},
    compiler.config?.build || {}
  )
  return compile_sass
}


exports.dev = (gulp, compiler, bs) => {
  function compile_sass() {
    return gulp.src(`${source}/*.{scss,sass}`, { sourcemaps: true })
        .pipe(sass(cfg).on('error', sass.logError))
        .pipe(gulp.rename({ extname: '.min.css' }))
        .pipe(gulp.dest(target, { sourcemaps: '.' }))
        .pipe(bs.stream())
    }
  const sass = require('gulp-sass')(require('sass'))

  const source = 'src/' + (compiler.source || 'sass')
  const target = 'dev/' + (compiler.target || 'static/css')
  const cfg = gulp.mergeOptions(
    {
      sourceComments: true,
    },
    compiler.config?.all || {},
    compiler.config?.development || {}
  )
  return gulp.watch(
    [`${source}/**/*.{scss,sass}`],
    {
      ignoreInitial: false,
      usePolling: true,
    },
    compile_sass
  )
}
