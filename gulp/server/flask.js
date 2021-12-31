// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

const default_cfg = {
    entrypoint: 'application.py',
    environ: {},
    port: 1,
    source: 'flaskapp',
    target: 'flaskapp',
}

exports.dependencies = [
]


exports.build = (gulp, server, target_root) => {
    function build_flask_app(done) {
        gulp.src([
            `src/${cfg.source}/**/*.py`,
            `src/${cfg.source}/**/*.html`,
            `src/${cfg.source}/**/*.jinja2`,
            `src/${cfg.source}/**/*.j2`,
        ]).pipe(gulp.dest(`${target_root}${cfg.target}`))
        done()
    }
    function build_flask_requirements(done) {
        require('child_process').execSync(
            "poetry export --format requirements.txt --output requirements.txt --without-hashes",
            {
                shell: '/bin/bash',
                stdio: 'inherit'
            }
        )
        gulp.src("requirements.txt").pipe(gulp.dest(target_root))
        done()
    }
    const cfg = gulp.mergeOptions(default_cfg, server)
    return gulp.parallel(build_flask_requirements, build_flask_app)
}


exports.dev = (gulp, server, bscfg, i) => {
    const { spawn } = require('child_process')

    const cfg = gulp.mergeOptions(default_cfg, server)

    // we'll launch Flask on this port...
    var port = bscfg.port + cfg.port

    // ... and have BrowserSync proxy everything to it
    bscfg.server = null
    bscfg.proxy = `http://localhost:${port}`

    gulp.watch([
        `src/${cfg.source}/**/*.py`,
        `src/${cfg.source}/**/*.html`,
        `src/${cfg.source}/**/*.jinja2`,
        `src/${cfg.source}/**/*.j2`,
        ], 
        {
            ignoreInitial: true,
            usePolling: true,
        },
        gulp.reloadBrowsers
    )

    cfg.environ.FLASK_APP = `src/${cfg.source}/${cfg.entrypoint}`
    cfg.environ.FLASK_ENV = 'development'
    var cmd = `poetry run flask run --port ${port}`.split(' ')
    return spawn(cmd[0], cmd.slice(1), {
        stdio: 'inherit',
        shell: '/bin/bash',
        env: { ...process.env, ...cfg.environ }
    })
}
