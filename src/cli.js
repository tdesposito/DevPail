#!/usr/bin/env node

// This file is part of DevPail, (https://github.com/tdesposito/DevPail)
// Copyright (C) Todd D. Esposito 2021.
// Distributed under the MIT License (see https://opensource.org/licenses/MIT).

const { spawnSync, execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const status = processOptions()
if (status) {
    console.log(`DevPail: ${status}`)
}

function buildImage(opts) {
    console.log(`DevPail: Building image "devpail:${opts.tag}"...`)
    spawnopts = {
        cwd: path.resolve(__dirname, '..', 'imagesrc'),
        shell: true,
        stdio: 'inherit'
    }

    spawnSync(
        "docker",
        [
            "build",
            "-t",
            `devpail:${opts.tag}`,
            ...opts.vars.flatMap(v => ['--build-arg', v]),
            "."
        ],
        spawnopts
    )
    console.log("DevPail: Cleaning dangling images...")
    spawnSync("docker", "image prune --force".split(' '), spawnopts)
    return null
}


function cleanProject() {
    console.log('DevPail: cleaning up artifacts...')
    var project = path.basename(process.cwd())
    spawnSync(
        "docker",
        [
            "volume",
            "rm",
            `${project}-DevPailTooling`
        ],
        {
            shell: true,
            stdio: 'inherit'
        }
    )
    return null
}


function initProject() {
    console.log('DevPail: Setting defaults for your project...')
    var pkg = JSON.parse(fs.readFileSync('./package.json').toString())
    if (pkg.devpail === undefined) {
        pkg.devpail = {}
    }
    ['compilers', 'ports', 'servers', 'tasks'].forEach((key) => {
        if (pkg.devpail[key] === undefined) {
            pkg.devpail[key] = []
        }
    })
    if (pkg.devpail.ports.length === 0) {
        pkg.devpail.ports = ['3000:3000']
    }
    if (pkg.devpail.imageTag === undefined) {
        pkg.devpail.imageTag = 'default'
    }
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2))
}


function killProject() {
    var project = path.basename(process.cwd())
    var id = execSync(`docker container ls --filter "name=${project}-DevPail" --format "{{.ID}}"`).toString()
    if (id) {
        console.log(`DevPail: killing active container for ${project}...`)
        spawnSync(
            'docker',
            [
                "container",
                "kill",
                id
            ],
            {
                shell: true,
                stdio: 'inherit'
            }
        )
    } else {
        console.log(`DevPail: no active container for ${project}...`)
    }
}


function processOptions() {
    var args = process.argv.slice(2)
    var opts = { tag: 'default', commands: [], params: [] }
    if (args && args[0] === '--build') {
        args.shift()
        opts.build = true
        if (args.length) {
            opts.tag = args.shift()
        }
        opts.vars = args
        return buildImage(opts)
    } else if (args && args[0] === '--init') {
        return initProject()
    } else if (args && args[0] === '--clean') {
        return cleanProject()
    } else if (args && args[0] === '--kill') {
        return killProject()
    } else {
        if (args && args[0] === '--shell') {
            console.log("DevPail: Running a shell in your project container...")
            opts.params = ['--entrypoint', '/bin/bash']
            args.shift()
            opts.commands = args
        } else {
            console.log("DevPail: Starting your development environment...")
            opts.commands = args
        }
        return runContainer(opts)
    }
}


function runContainer(opts) {
    var tag, ports
    var project = path.basename(process.cwd())
    try {
        pkg = require(`${process.cwd()}/package.json`)
        tag = pkg.devpail?.imageTag || 'default'
        ports = pkg.devpail?.ports || ['3000:3000']
    } catch (error) {
        return "DevPail: I couldn't find or parse your 'package.json'."
    }

    opts.params.push(...['--name', `${project}-DevPail-${(new Date().getTime()).toString().slice(6)}`])
    opts.params.push(...['--hostname', project])
    opts.params.push(...['-v', `${project}-DevPail-Tooling:/home/pn/app`])
    opts.params.push(...['-v', `${process.cwd()}:/home/pn/app/src`])
    opts.params.push(...ports.flatMap(p => ['-p', p]))
    
    spawnSync(
        "docker",
        [
            "run",
            "-it",
            "--rm",
            ...opts.params,
            `devpail:${tag}`,
            ...opts.commands
        ],
        {
            shell: true,
            stdio: 'inherit'
        }
    )
    return null
}

