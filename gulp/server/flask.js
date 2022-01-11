// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [
    'fs-extra'
]

const default_cfg = {
    entrypoint: 'application.py',
    environ: {},
    port: 1,
    source: 'flaskapp',
    target: 'flaskapp',
}

const extensions = '*.{py,html,jinja2,j2}'

exports.build = (gulp, server) => {
    function build_flask_app() {
        return gulp.src(`src/${cfg.source}/**/${extensions}`)
            .pipe(gulp.dest(`build/`))
    }
    function build_flask_requirements(done) {
        require('child_process').execSync(
            "poetry export --format requirements.txt --output requirements.txt --without-hashes",
            {
                shell: '/bin/bash',
                stdio: 'inherit'
            }
        )
        return gulp.src("requirements.txt").pipe(gulp.dest('build/'))
    }
    const cfg = gulp.mergeOptions(default_cfg, server)
    return gulp.parallel(build_flask_requirements, build_flask_app)
}


exports.dev = (gulp, server, bscfg) => {
    function sync_app() {
        return gulp.src(`src/${cfg.source}/**/${extensions}`, { since: gulp.lastRun(sync_app) })
            .pipe(gulp.dest(`dev/`))
    }

    const fs = require('fs-extra')
    const cfg = gulp.mergeOptions(default_cfg, server)

    // we'll launch Flask on this port...
    var port = bscfg.port + cfg.port

    if (! server.isProxied) {
        // ... and have BrowserSync proxy EVERYTHING to it
        bscfg.server = null
        bscfg.proxy = `http://localhost:${port}`
    }   // ... otherwise, there must be a `proxy` server configured which points here

    gulp.watch(`src/${cfg.source}/**/${extensions}`, 
        {
            ignoreInitial: false,
            usePolling: true,
        },
        gulp.series(sync_app, gulp.reloadBrowsers)
    )

    cfg.environ.FLASK_APP = `dev/${cfg.entrypoint}`
    cfg.environ.FLASK_ENV = 'development'
    var cmd = `poetry run flask run --port ${port}`.split(' ')

    // before Flask can run, we need to seed dev/
    if (! fs.existsSync(cfg.environ.FLASK_APP)) {
        console.log('DevPail: Seeding flask app...')
        fs.copySync(`src/${cfg.source}/`, `dev/`, {
            filter: (src, dest) => {
                return fs.lstatSync(src).isDirectory()
                    || src.endsWith('.py') 
            }
        })
    }

    return require('child_process').spawn(cmd[0], cmd.slice(1), {
        stdio: 'inherit',
        shell: '/bin/bash',
        env: { ...process.env, ...cfg.environ }
    })
}
