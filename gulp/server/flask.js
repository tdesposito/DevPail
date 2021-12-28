// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [
]


exports.build = (gulp, server) => {
}


exports.dev = (i, server, bscfg) => {
    const { spawn } = require('child_process')

    var port = bscfg.port + (server.port || (i + 1))

    bscfg.server = null
    bscfg.proxy = `http://localhost:${port}`

    if (server.watch) {
        bscfg.files.push(...server.watch)
    }

    var cmd = server.command.replace('{{port}}', port.toString()).split(' ')
    var cmd_env = server.environment || {}
    for (const [k, v] of Object.values(cmd_env)) {
        cmd_env[k] = v.replace('{{port}}', port.toString())
    }
    return spawn(cmd[0], cmd.slice(1), {
        stdio: 'inherit',
        shell: '/bin/bash',
        env: { ...process.env, ...cmd_env }
    })
}
