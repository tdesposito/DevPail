// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = ['serverless']
exports.packages = ['build']

const defaultConfig = {
    "source": "lambdas",
}

exports.task = (gulp, cfg, name) => {
    function _deploy_lambda(lambdaName, tempDir = '') {
        if (tempDir) {
            fs.symlinkSync(tempDir, `src/${config.source}/${lambdaName}/${path.basename(tempDir)}`)
        }
        const deployProc = require('child_process').spawnSync(
            'serverless', 
            [ 'deploy' ],
            { 
                cwd: `src/${config.source}/${lambdaName}`,
                env: { ...process.env, DEVPAIL_TEMP_BUILD: path.basename(tempDir) },
                shell: '/bin/bash',
                stdio: 'inherit', 
            }
        )
        if (tempDir) {
            fs.unlinkSync(`src/${config.source}/${lambdaName}/${path.basename(tempDir)}`)
        }
        return deployProc.status
    }

    function _deploy_layer(layer) {
        const os = require('os')

        var buildDirs = {}
        var buildComplete = true    // until proven guilty
        var tempDir
        var steps = layer.build
        if (typeof steps === 'string') {
            steps = [steps]
        }

        steps.forEach((step, index) => {
            var command, cwd
            if (typeof step === 'string') {
                command = step
            } else {
                ({command, cwd} = step)
            }

            tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devpail-lambda-build-'))
            buildDirs[`build_dir_${index}`] = tempDir
            Object.entries(buildDirs).forEach(([k, v]) => {
                command = command.replace(`{{${k}}}`, v)
            })
            command = command.replace('{{build_dir}}', tempDir).split(' ')

            const buildProc = require('child_process').spawnSync(
                command[0],
                command.slice(1),
                {
                    cwd: `src/${config.source}/${layer.name}${cwd ? ('/' + cwd) : ''}`,
                    env: {...process.env, DEVPAIL_TEMP_BUILD: tempDir},
                    shell: '/bin/bash',
                    stdio: 'inherit', 
                }
            )
            buildComplete = buildComplete & buildProc.status === 0
        })

        if (buildComplete) {
            return _deploy_lambda(layer.name, tempDir)
        }
        return -1
    }

    function pushLambdaTask(lambdaName) {
        var f = function (done) {
            _deploy_lambda(lambdaName)
            done()
        }
        Object.defineProperty(f, 'name', { value: `deploy lambda: ${lambdaName}`, writable: false })
        tasks.push(f)
    }

    function lambdaIsChanged(name) {
        var code = 0, deploy = 0

        fs.readdirSync(`src/${config.source}/${name}`).forEach(filename => {
            if (filename === '.serverless') {
                deploy = fs.statSync(`src/${config.source}/${name}/${filename}`).mtime.getTime()
            } else {
                code = Math.max(code, fs.statSync(`src/${config.source}/${name}/${filename}`).mtime.getTime())
            }
        })
        return code > deploy
    }

    function dependsOnUpdatedLayer(lambda) {
        return lambda.layers.filter(x => updatedLayers.some(y => y === x)).length > 0
    }

    const fs = require('fs')
    const path = require('path')
    const config = gulp.mergeOptions(defaultConfig, cfg)

    var tasks = []
    var updatedLayers = []

    config.lambdas.forEach(lambda => {
        if (typeof lambda === 'string') {
            if (lambdaIsChanged(lambda)) {
                pushLambdaTask(lambda)
            }
        } else if (lambda.isLayer) {
            if (lambdaIsChanged(lambda.name)) {
                var f = function (done) {
                    _deploy_layer(lambda)
                    done()
                }
                Object.defineProperty(f, 'name', { value: `deploy layer: ${lambda.name}`, writable: false })
                tasks.push(f)
                updatedLayers.push(lambda.name)
            }
        } else if (lambdaIsChanged(lambda.name) || dependsOnUpdatedLayer(lambda)) {
            pushLambdaTask(lambda.name)
        }
    })

    if (tasks.length) {
        return gulp.series(...tasks)
    }
    return (done) => { done() }
}
