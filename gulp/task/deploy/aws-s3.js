// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.packages = [
    "awscli",
]


exports.task = (gulp, cfg, name) => {
    function sync_to_s3(done) {
        const cmd = `aws s3 sync build/ s3://${cfg.bucket} --delete --acl public-read`
        execSync(cmd, { shell: '/bin/bash', stdio: 'inherit'})
        done()
    }

    function invalidate_cdn(done) {
        const cmd = `aws cloudfront create-invalidation --distribution-id ${cfg.distribution} --paths "/*"`
        execSync(cmd, { shell: '/bin/bash', stdio: 'inherit' })
        done()
    }

    function setup_s3(done) {
        const opts = cfg.createOptions || []
        const cmdopts = opts.map(opt => `--${opt}`).join(' ')
        const cmd = `aws s3api create-bucket --bucket ${cfg.bucket} ${cmdopts}`
        execSync(cmd, { shell: '/bin/bash', stdio: 'inherit' })
        done()
    }

    const { execSync } = require('child_process')
    if (name.endsWith(':setup')) {
        return setup_s3
    } else {
        const tasks = ['build', sync_to_s3]
        if (cfg.distribution) {
            tasks.push(invalidate_cdn)
        }
        return gulp.series(...tasks)
    }
}