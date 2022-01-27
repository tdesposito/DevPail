// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [ 'cvbump', 'rfdc' ]

const defaultConfig = {
    'commit': true,
    'tag': true,
}

exports.task = (gulp, cfg, name) => {
    function bump_prerelease(done) {
        process.chdir('src')
        cvbump.pre(config)
        process.chdir('..')
        done()
    }
    function bump_release(done) {
        process.chdir('src')
        cvbump.release(config)
        process.chdir('..')
        done()
    }
    function bump_automatic(done) {
        process.chdir('src')
        cvbump.auto(config)
        process.chdir('..')
        done()
    }

    const cvbump = require('cvbump')
    var config = gulp.mergeOptions(defaultConfig, cfg.all || {})

    const [_name, mode, stage, comp] = name.split(':')

    if (mode === 'pre') {
        config = gulp.mergeOptions(config, cfg.pre || {})
        if (stage) { config[stage] = true }
        if (comp) { config[comp] = true }
        return bump_prerelease
    } else if (mode === 'release') {
        config = gulp.mergeOptions(config, cfg.release || {})
        return bump_release
    } else {
        return bump_automatic
    }


    return bump_version
}
