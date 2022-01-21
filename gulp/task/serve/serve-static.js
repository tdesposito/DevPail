// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = []
exports.packages = []

exports.task = (gulp, cfg, name) => {
    function serve_as_built(done) {
        console.log('Serving the as-built application; ctrl-c to end.')
        require('child_process').spawnSync(
            "npx",
            [
                "--quiet",
                "serve",
                "-p",
                "3000",
                "build"
            ],
            {
                shell: true,
                stdio: 'inherit',
            }
        )
        done()
    }
    
    return gulp.series('build', serve_as_built)
}
