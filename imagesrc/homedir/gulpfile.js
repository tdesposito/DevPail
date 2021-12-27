// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

const version = '1.0.0'

const gulp = require('gulp')
const requireUrl = require('require-from-url/sync')

var cfg = { 
  prj: require('./package.json').devpail, 
  servers: [], 
  compilers: [],
}


function confiureBrowserSync(cfg) {
  const bsCfg = {
    port: 3000,
    ui: { port: 3009 },
    open: false,
    server: {
      baseDir: "./dev",
      routes: {},
      middleware: [],
    },
    files: [],
    online: false,
  }

  if (cfg.prj.ssl) {
    bsCfg.https = cfg.prj.ssl
  }
  return bsCfg
}


// function runHooks(hookName, done) {
//   const { spawnSync } = require('child_process')
//   var allhooks = cfg.prj.hooks || {}
//   var hooklist = allhooks[hookName]
//   if (hooklist) {
//     if (! Array.isArray(hooklist)) {
//       hooklist = [hooklist]
//     }
//     hooklist.forEach(hook => {
//       var cmd = hook.split(' ')
//       spawnSync(cmd[0], cmd.slice(1), { stdio: 'inherit', shell: '/bin/bash' })
//     }
//   }
//   done()
// }


exports.build = (done) => {
  console.log("TODO: write `build`")
  done()
}


exports.default = (done) => {
  cfg.servers.BrowserSync = require('browser-sync').create()
  const bsCfg = confiureBrowserSync(cfg)

  // Create our server proceeses, if any
  ;(cfg.prj.servers || []).forEach((server, i) => {
    cfg.servers[i] = smartRequire('server', server.type).dev(i, server, bsCfg)
  })
  cfg.servers.BrowserSync.init(bsCfg)

  // Create watchers for our dev compilers, if any
  ;(cfg.prj.compilers || []).forEach((compiler, i) => {
    cfg.compilers[i] = smartRequire('compiler', compiler.type).dev(gulp, compiler, cfg.servers.BrowserSync)
  })
}
exports.dev = exports.default // Just a little aliasing...


exports.smartRequire = smartRequire
function smartRequire(module_type, module_name) {
  var module
  var importname = `${module_type}/${module_name.trim('~')}`
  if (module_name.startsWith('~')) {
    importname = `./src/${importname}`
  } else {
    var cdn = cfg.prj.moduleCDN || "https://cdn.jsdelivr.net/gh/tdesposito/DevPail@1/gulp"
    importname = `${cdn}/${importname}.js`
  }
  if (importname.startsWith('.')) {
    module = require(importname)
  } else {
    module = requireUrl(importname)
  }
  
  if (module.install?.length) {
    console.log(`DevPail: installing module(s): ${module.install}`)
    require('child_process').execSync(
      ['npm install --save-dev', ...module.install, '--no-audit --no-fund'].join(' '),
      {
        shell: '/bin/bash',
        stdio: 'inherit',
      }
    )
  }

  return module
}

// add tasks from the devpail config
(cfg.prj.tasks || []).forEach((task, i) => {
  exports[task.name] = (done) => {
    var module = smartRequire('task', task.type)
    module.task(gulp, task)
    done()
  }
})
