// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [
  'gulp-sass',
  'sass',
]


exports.build = (gulp, compiler, target_root) => {
  function compile_sass(done) {
    gulp.src([`${source}/*.scss`, `${source}/*.sass`], { sourcemaps: false })
      .pipe(sass(cfg).on('error', sass.logError))
      .pipe(gulp.rename({ extname: '.min.css' }))
      .pipe(gulp.dest(target))
    done()
  }
  const sass = require('gulp-sass')(require('sass'))

  const source = 'src/' + (compiler.source || 'sass')
  const target = target_root + (compiler.target || 'static/css')
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


exports.dev = (gulp, compiler, bs, target_root) => {
  function compile_sass(done) {
      gulp.src([`${source}/*.scss`, `${source}/*.sass`], { sourcemaps: true })
        .pipe(sass(cfg).on('error', sass.logError))
        .pipe(gulp.rename({ extname: '.min.css' }))
        .pipe(gulp.dest(target, { sourcemaps: '.' }))
        .pipe(bs.stream())
      done()
    }
  const sass = require('gulp-sass')(require('sass'))

  const source = 'src/' + (compiler.source || 'sass')
  const target = target_root + (compiler.target || 'static/css')
  const cfg = gulp.mergeOptions(
    {
      sourceComments: true,
    },
    compiler.config?.all || {},
    compiler.config?.development || {}
  )
  return gulp.watch(
    [`${source}/**/*.scss`, `${source}/**/*.sass`],
    {
      ignoreInitial: false,
      usePolling: true,
    },
    compile_sass
  )
}
