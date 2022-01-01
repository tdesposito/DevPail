// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.packages = [
    "awscli",
]


exports.task = (gulp, task) => {
    function sync_to_s3(done) {
        const cmd = `aws s3 sync build/ s3://${task.bucket} --delete --acl public-read`
        require('child_process').execSync(cmd, { shell: '/bin/bash', stdio: 'inherit'})
        done()
    }

    function invalidate_cdn(done) {
        const cmd = `aws cloudfront create-invalidation --distribution-id ${task.distribution} --paths "/*"`
        require('child_process').execSync(cmd, { shell: '/bin/bash', stdio: 'inherit' })
        done()
    }

    const tasks = ['build', sync_to_s3]
    if (task.distribution) {
        tasks.push(invalidate_cdn)
    }

    return gulp.series(...tasks)
}