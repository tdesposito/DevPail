// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

const fs = require('fs')

const gulp = require('gulp')
const requireUrl = require('require-from-url/sync')

// Add oft-used utilities into the gulp object
gulp.rename = require('gulp-rename')
gulp.del = require('del')
gulp.mergeOptions = require('merge-options')

var cfg = { 
  prj: require(`${process.cwd()}/package.json`).devpail || {}, 
  servers: [], 
  compilers: [],
}

// the `installed` object tracks which modules we've installed for plugins
var installed = new class {
  #data = {
    modules: [],
    count: 0,
  }
  #cache_filename = `${process.cwd()}/.devpail.json`
  constructor() {
    if (fs.existsSync(this.#cache_filename)) {
      this.#data = JSON.parse(fs.readFileSync(this.#cache_filename))
      }
  }
  get modules() { return this.#data.modules }
  save() {
    if (this.#data.modules.length !== this.#data.count) {
      this.#data.count = this.#data.modules.length
      fs.writeFileSync(this.#cache_filename, JSON.stringify(this.#data, null, 2))
    }
  }
}


function configureBrowserSync(cfg) {
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


function smartRequire(module_type, module_name) {
  var module
  var import_name = `${module_type}/${module_name.trim('~')}`
  if (module_name.startsWith('~')) {
    import_name = `./src/${import_name}`
  } else {
    var cdn = cfg.prj.moduleCDN || "https://cdn.jsdelivr.net/gh/tdesposito/DevPail@1/gulp"
    import_name = `${cdn}/${import_name}.js`
  }
  if (import_name.startsWith('.')) {
    module = require(import_name)
  } else {
    module = requireUrl(import_name)
  }

  if (module.dependencies?.length) {
    var to_install = module.dependencies.filter(module => !installed.modules.includes(module))
    if (to_install.length) {
      console.log(`DevPail: installing module(s): ${to_install}`)
      require('child_process').execSync(
        ['npm install --save-dev --no-audit --no-fund', ...to_install].join(' '),
        {
          shell: '/bin/bash',
          stdio: 'inherit',
        }
      )
    }
    installed.modules.push(...to_install)
  }

  return module
}


exports.build = (done) => {
  var parallel_tasks = []
  var buildsteps = [
    function clean() { return gulp.del('./build/**') }
  ]

  ;(cfg.prj.servers || []).forEach((server, i) => {
    var module = smartRequire('server', server.type)
    // server tasks run in series unless explicitly marked as parallel
    if (server.parallel === true) {
      parallel_tasks.push(module.build(gulp, server))
    } else {
      buildsteps.push(module.build(gulp, server))
    }
  })

  ;(cfg.prj.compilers || []).forEach((compiler, i) => {
    var module = smartRequire('compiler', compiler.type)
    // compiler tasks run in parallel unless explicitly marked otherwise
    if (compiler.parallel === false) {
      buildsteps.push(module.build(gulp, compiler))
    } else {
      parallel_tasks.push(module.build(gulp, compiler))
    }
  })

  if (parallel_tasks.length) {
    buildsteps.push(gulp.parallel(...parallel_tasks))
  }

  installed.save()
  return gulp.series(...buildsteps)(done)
}


exports.default = (done) => {
  cfg.servers.BrowserSync = require('browser-sync').create()
  const bsCfg = configureBrowserSync(cfg)

  // Create our server proceeses, if any
  ;(cfg.prj.servers || []).forEach((server, i) => {
    cfg.servers[i] = smartRequire('server', server.type).dev(i, server, bsCfg)
  })
  cfg.servers.BrowserSync.init(bsCfg)

  // Create watchers for our dev compilers, if any
  ;(cfg.prj.compilers || []).forEach((compiler, i) => {
    cfg.compilers[i] = smartRequire('compiler', compiler.type).dev(gulp, compiler, cfg.servers.BrowserSync)
  })
  installed.save()
}

// add any tasks from the devpail config
(cfg.prj.tasks || []).forEach((task, i) => {
  exports[task.name] = (done) => {
    var module = smartRequire('task', task.type)
    module.task(gulp, task)
    done()
  }
})
