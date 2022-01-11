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
