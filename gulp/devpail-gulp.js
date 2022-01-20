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
  var import_name = plugin_name.trim('~')
  if (plugin_name.startsWith('~')) {
    import_name = `./src/${import_name}`
  } else {
    import_name = `${cfg.prj.moduleCDN}/${import_name}.js`
  }
  if (import_name.startsWith('.')) {
    plugin = require(import_name)
  } else {
    plugin = requireUrl(import_name)
  }

  installer.add_dependencies(plugin.dependencies)
  installer.add_packages(plugin.packages)
  installer.save()

  return plugin
}


exports.build = (done) => {
  var parallel_tasks = []
  var series_tasks = [ gulp.parallel('clean', 'clean:deploy') ]

  // TODO: add pre-build hooks

  ;(cfg.prj.servers || []).forEach((server, i) => {
    var module = smartRequire(server.gulp)
    // server tasks run in series unless explicitly marked as parallel
    if (server.parallel === true) {
      parallel_tasks.push(module.build(gulp, server))
    } else {
      series_tasks.push(module.build(gulp, server))
    }
  })

  ;(cfg.prj.compilers || []).forEach((compiler, i) => {
    var module = smartRequire(compiler.gulp)
    // compiler tasks run in parallel unless explicitly marked otherwise
    if (compiler.parallel === false) {
      series_tasks.push(module.build(gulp, compiler))
    } else {
      parallel_tasks.push(module.build(gulp, compiler))
    }
  })

  if (parallel_tasks.length) {
    series_tasks.push(gulp.parallel(...parallel_tasks))
  }

  // TODO: add post-build hooks

  return gulp.series(...series_tasks)(done)
}


exports.clean = (done) => {
  return gulp.del([`./build/**/*`, `./build/**/.*`])
}


exports['clean:dev'] = (done) => {
  return gulp.del([`./dev/**/*`, `./dev/**/.*`])
}


exports['clean:deploy'] = (done) => {
  return gulp.del([`./deploy/**/*`, `./deploy/**/.*`])
}


exports.default = (done) => {
  cfg.BrowserSync = gulp.browserSync.create()
  const bsCfg = configureBrowserSync(cfg)

  // Server tasks MAY alter BrowserSync's config
  ;(cfg.prj.servers || []).forEach((server) => {
    cfg.servers.push(
      smartRequire(server.gulp).dev(gulp, server, bsCfg)
    )
  })

  cfg.BrowserSync.init(bsCfg)

  // Compiler tasks MAY interact with the running BrowserSync
  ;(cfg.prj.compilers || []).forEach((compiler) => {
    cfg.compilers.push(
      smartRequire(compiler.gulp)
        .dev(gulp, compiler, cfg.BrowserSync)
    )
  })
}

// add any additional tasks from the devpail config
(cfg.prj.tasks || []).forEach((task) => {
  (task.names || [task.name]).forEach(name => {
    exports[name] = (done) => {
      smartRequire(task.gulp).task(gulp, task, name)(done)
    }
  })
})

process.on('exit', () => {
  for (var server in cfg.servers) {
    if (server) {
      server.kill()
    }
  }
})
