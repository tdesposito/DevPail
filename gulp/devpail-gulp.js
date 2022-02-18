// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

const fs = require('fs')
const { parallel } = require('gulp')

const gulp = require('gulp')
const requireUrl = require('require-from-url/sync')

// Add oft-used utilities into the gulp object
gulp.rename = require('gulp-rename')
gulp.del = require('del')
gulp.mergeOptions = require('merge-options')
gulp.browserSync = require('browser-sync')
gulp.reloadBrowsers = reloadBrowsers

const default_cfg = {
  moduleCDN: 'https://cdn.jsdelivr.net/gh/tdesposito/DevPail@2/gulp',
}

var cfg = { 
  prj: gulp.mergeOptions(default_cfg, require(`${process.cwd()}/package.json`).devpail || {}), 
  servers: [], 
  compilers: [],
}

// the `installed` object tracks what we've installed for plugins
var installer = new class {
  #data = {
    modules: [],
    packages: [],
  }
  #updated = false
  #cache_filename = `${process.cwd()}/.devpail.json`
  constructor() {
    if (fs.existsSync(this.#cache_filename)) {
      this.#data = JSON.parse(fs.readFileSync(this.#cache_filename))
      }
  }
  add_dependencies(names) {
    if (names && names.length) {
      names = names.filter(name => ! this.#data.modules.includes(name) )
      if (names.length) {
        console.log(`DevPail: installing node module(s): ${names}`)
        require('child_process').execSync(
          ['npm install --save-dev --no-audit --no-fund', ...names].join(' '),
          {
            shell: '/bin/bash',
            stdio: 'inherit',
          }
        )
      }
      this.#data.modules.push(...names)
      this.#updated = true
    }
  }
  add_packages(names) {
    if (names && names.length) {
      names = names.filter(name => ! this.#data.packages.includes(name))
      if (names.length) {
        console.log(`DevPail: installing python package(s): ${names}`)
        require('child_process').execSync(
          ['pip install --upgrade --no-warn-script-location', ...names].join(' '),
          {
            shell: '/bin/bash',
            stdio: 'inherit',
          }
        )
      }
      this.#data.packages.push(...names)
      this.#updated = true
    }
  }
  save() {
    if (this.#updated) {
      fs.writeFileSync(this.#cache_filename, JSON.stringify(this.#data, null, 2))
      this.#updated = false
    }
  }
}


function configureBrowserSync(cfg) {
  const bsCfg = {
    port: 3000,
    ui: { port: 3009 },
    open: false,
    server: {
      baseDir: 'dev/',
      routes: {},
      middleware: [],
    },
    socket: {
      domain: `localhost:${process.env.DEVPAIL_BS_PORT}`,
    },
    files: [],
    online: false,
  }

  if (cfg.prj.ssl) {
    bsCfg.https = cfg.prj.ssl
  }
  return bsCfg
}


function reloadBrowsers(done) {
  cfg.BrowserSync.reload()
  done()
}


function smartRequire(plugin_name) {
  var plugin
  if (plugin_name.startsWith('~')) {
    plugin = require(`${process.cwd()}/src/${plugin_name.replace(/^~/, '')}`)
  } else {
    plugin = requireUrl(`${cfg.prj.moduleCDN}/${plugin_name}.js`)
  }

  installer.add_dependencies(plugin.dependencies)
  installer.add_packages(plugin.packages)
  installer.save()

  return plugin
}


exports['devpail:build'] = (done) => {
  var parallel_tasks = []
  var series_tasks = []

  ;(cfg.prj.servers || []).forEach((server, i) => {
    var plugin, pluginConfig = {}
    if (typeof server === 'string') {
      plugin = smartRequire(server)
    } else {
      plugin = smartRequire(server.plugin)
      pluginConfig = server
    }
    // server tasks run in series unless explicitly marked as parallel
    if (pluginConfig.parallel === true) {
      parallel_tasks.push(plugin.build(gulp, pluginConfig))
    } else {
      series_tasks.push(plugin.build(gulp, pluginConfig))
    }
  })

  ;(cfg.prj.compilers || []).forEach((compiler, i) => {
    var plugin, pluginConfig = {}
    if (typeof compiler === 'string') {
      plugin = smartRequire(compiler)
    } else {
      plugin = smartRequire(compiler.plugin)
      pluginConfig = compiler
    }
    // compiler tasks run in parallel unless explicitly marked otherwise
    if (pluginConfig.parallel === false) {
      series_tasks.push(plugin.build(gulp, pluginConfig))
    } else {
      parallel_tasks.push(plugin.build(gulp, pluginConfig))
    }
  })

  if (parallel_tasks.length) {
    series_tasks.push(gulp.parallel(...parallel_tasks))
  }

  return gulp.series(...series_tasks)(done)
}


exports['clean:build'] = (done) => {
  return gulp.del([`./build/**/*`, `./build/**/.*`])
}


exports['clean:dev'] = (done) => {
  return gulp.del([`./dev/**/*`, `./dev/**/.*`])
}


exports.default = (done) => {
  cfg.BrowserSync = gulp.browserSync.create()
  const bsCfg = configureBrowserSync(cfg)

  // Server tasks MAY alter BrowserSync's config
  ; (cfg.prj.servers || []).forEach((server) => {
    if (typeof server === 'string') {
      cfg.servers.push(
        smartRequire(server).dev(gulp, {}, bsCfg)
      )
    } else {
      cfg.servers.push(
        smartRequire(server.plugin).dev(gulp, server, bsCfg)
      )
    }
  })

  cfg.BrowserSync.init(bsCfg)

  // Compiler tasks MAY interact with the running BrowserSync
  ; (cfg.prj.compilers || []).forEach((compiler) => {
    if (typeof compiler === 'string') {
      cfg.compilers.push(
        smartRequire(compiler)
          .dev(gulp, {}, cfg.BrowserSync)
      )
    } else {
      cfg.compilers.push(
        smartRequire(compiler.plugin)
          .dev(gulp, compiler, cfg.BrowserSync)
      )
    }
  })
}

// add any additional tasks from the devpail config
; (cfg.prj.tasks || []).forEach((task) => {
  var names = (typeof task.name === 'string' ? [task.name] : task.name)
  names.forEach(name => {
    exports[name] = (done) => {
      smartRequire(task.plugin).task(gulp, task, name)(done)
    }
  })
})

const metas = {
  build: [
    'clean:build',
    'devpail:build'
  ],
  clean: [[ 'clean:build', 'clean:dev' ]],
  ...(cfg.prj.metatasks || {})
}

// add meta-tasks
; (Object.entries(metas)).forEach(([name, tasks]) => {
  var task_list = []
  tasks.forEach(task => {
    if (typeof task === 'string') {
      task_list.push(task)
    } else {
      function parallel_tasks(tasks) {
        return (done) => gulp.parallel(...tasks)(done)
      }
      task_list.push(parallel_tasks(task))
    }
  })
  exports[name] = (done) => gulp.series(...task_list)(done)
})

process.on('exit', () => {
  for (var server in cfg.servers) {
    if (server) {
      server.kill()
    }
  }
})
