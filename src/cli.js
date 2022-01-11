#!/usr/bin/env node

// This file is part of DevPail, (https://github.com/tdesposito/DevPail)
// Copyright (C) Todd D. Esposito 2021.
// Distributed under the MIT License (see https://opensource.org/licenses/MIT).

const { spawnSync, execSync } = require('child_process')
const fs = require('fs-extra')
const os = require('os')
const path = require('path')

const status = processOptions()
if (status) {
    console.log(`\nDevPail: ${status}\n`)
}

function buildImage(opts) {
    console.log(`DevPail: Building image "devpail:${opts.tag}"...`)

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devpail-'))
    const fromDir = os.homedir()
    const toDir = `${tmpDir}/homedir`

    fs.copySync(path.resolve(__dirname, '..', 'imagesrc'), tmpDir)

    if (fs.existsSync(`${fromDir}/.ssh`)) {
        fs.copySync(`${fromDir}/.ssh`, `${toDir}/.ssh`, { dereference: true })
    }

    for (var file of ['config', 'credentials']) {
        if (fs.existsSync(`${fromDir}/.aws/${file}`)) {
            fs.ensureDirSync(`${toDir}/.aws`)
            fs.copySync(`${fromDir}/.aws/${file}`, `${toDir}/.aws/${file}`, { dereference: true })
        }
    }

    for (var file of ['.gitconfig', '.git-credentials']) {
        if (fs.existsSync(`${fromDir}/${file}`)) {
            fs.copySync(`${fromDir}/${file}`, `${toDir}/${file}`, { dereference: true })
        }
    }


    spawnopts = {
        cwd: tmpDir,
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
    console.log("DevPail: Cleaning up...")
    spawnSync("docker", "image prune --force".split(' '), spawnopts)

    fs.rmSync(tmpDir, { recursive: true })

    return `WARNING: Do NOT publish or share "devpail:${opts.tag}"\n\tIt contains YOUR SECRETS, possibly including ssh keys, aws tokens, and git credentials!`
}


function cleanProject() {
    console.log('DevPail: cleaning up artifacts...')
    var project = path.basename(process.cwd())
    spawnSync(
        "docker",
        [
            "volume",
            "rm",
            `${project}-DevPail-Tooling`
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
    if (args && args[0] === '--version') {
        return 'version 1.1.0'
    } else if (args && args[0] === '--help') {
        console.log("usage: devpail [options] [gulp option(s)/task(s)...]\n")
        console.log("Options:")
        console.log("\t--build [tag] [args...] - build a new DevPail docker image")
        console.log("\t--cdn [port] - serve the included Gulp plugins locally")
        console.log("\t--clean - remove the project's docker volume")
        console.log("\t--init - add/update a 'devpail' key in the local package.json")
        console.log("\t--kill - kill the running DevPail environment")
        console.log("\t--shell - shell into the DevPail environment")
        console.log("\n")
        console.log("With none of the above specified, everything on the command\nline will be arguments to the Gulp process.")
        console.log("\n")
    } else if (args && args[0] === '--build') {
        args.shift()
        opts.build = true
        if (args.length) {
            opts.tag = args.shift()
        }
        opts.vars = args
        return buildImage(opts)
    } else if (args && args[0] === '--cdn') {
        args.shift()
        serveCDN(args)
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
    if (fs.existsSync(`${process.cwd()}/.env`)) {
        console.log('DevPail: Injecting your .env variables')
        opts.params.push(...['--env-file', `${process.cwd()}/.env`])
    }
    opts.params.push(...['-e', `DEVPAIL_BS_PORT=${ports[0].split(':')[0]}`])
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


function serveCDN(opts) {
    var port = opts[0] || "8000"
    console.log(`DevPail: serving plugins on host.docker.internal:${port}...`)
    spawnSync(
        "npx",
        [
            "--quiet",
            "serve",
            "-l",
            `tcp://0.0.0.0:${port}`
        ],
        {
            cwd: path.resolve(__dirname, '..', 'gulp'),
            shell: true,
            stdio: 'inherit',
        }
    )
}