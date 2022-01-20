// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).


exports.dependencies = []


exports.build = (gulp, compiler) => {
    function copy_extra_files() {
        return gulp.src(source)
            .pipe(gulp.dest(target))
    }
    const source = `src/${compiler.source}/${compiler.glob}`
    const target = `build/${compiler.target}`
    return copy_extra_files
}


exports.dev = (gulp, compiler, bs) => {
    function copy_extra_files_noop(done) {
        done()
    }
    function copy_extra_files() {
        return gulp.src(source)
            .pipe(gulp.dest(target))
    }
    const source = `src/${compiler.source}/${compiler.glob}`
    const target = `dev/${compiler.target}`

    if (compiler.buildOnly) {
        return copy_extra_files_noop
    }
    console.log(`watching ${source}`)

    return gulp.watch(source,
        {
            ignoreInitial: false,
            usePolling: true,
        },
        copy_extra_files
    )
}
