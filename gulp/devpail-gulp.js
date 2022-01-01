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
  moduleCDN: 'https://cdn.jsdelivr.net/gh/tdesposito/DevPail@1/gulp',
  roots: {
    build: 'build/',
    dev: 'dev/',
    src: 'src/'
  },
}

var cfg = { 
  prj: gulp.mergeOptions(default_cfg, require(`${process.cwd()}/package.json`).devpail || {}), 
  servers: [], 
  compilers: [],
}

// the `installed` object tracks which modules we've installed for plugins
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
          ['pip install --upgrade ', ...names].join(' '),
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
    }
  }
}


function configureBrowserSync(cfg) {
  const bsCfg = {
    port: 3000,
    ui: { port: 3009 },
    open: false,
    server: {
      baseDir: cfg.prj.roots.dev,
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


function smartRequire(plugin_type, plugin_name) {
  var plugin
  var import_name = `${plugin_type}/${plugin_name.trim('~')}`
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
  var series_tasks = [ 'clean' ]

  ;(cfg.prj.servers || []).forEach((server, i) => {
    var module = smartRequire('server', server.type)
    // server tasks run in series unless explicitly marked as parallel
    if (server.parallel === true) {
      parallel_tasks.push(module.build(gulp, server, cfg.prj.roots.build))
    } else {
      series_tasks.push(module.build(gulp, server, cfg.prj.roots.build))
    }
  })

  ;(cfg.prj.compilers || []).forEach((compiler, i) => {
    var module = smartRequire('compiler', compiler.type)
    // compiler tasks run in parallel unless explicitly marked otherwise
    if (compiler.parallel === false) {
      series_tasks.push(module.build(gulp, compiler, cfg.prj.roots.build))
    } else {
      parallel_tasks.push(module.build(gulp, compiler, cfg.prj.roots.build))
    }
  })

  if (parallel_tasks.length) {
    series_tasks.push(gulp.parallel(...parallel_tasks))
  }

  installer.save()
  return gulp.series(...series_tasks)(done)
}


exports.clean = (done) => {
  return gulp.del(`./${cfg.prj.roots.build}**/*`)
}


exports['clean:dev'] = (done) => {
  if (cfg.prj.roots.dev.startsWith(cfg.prj.roots.src)) {
    console.log("\nThis project's 'source' and 'dev' may be connected; Won't clean dev!\n")
    done()
  } else {
    return gulp.del(`./${cfg.prj.roots.dev}**/*`)
  }
}


exports.default = (done) => {
  cfg.BrowserSync = gulp.browserSync.create()
  const bsCfg = configureBrowserSync(cfg)

  // Server tasks MAY alter BrowserSync's config
  ;(cfg.prj.servers || []).forEach((server, i) => {
    cfg.servers.push(
      smartRequire('server', server.type).dev(gulp, server, bsCfg, i)
    )
  })

  cfg.BrowserSync.init(bsCfg)

  // Compiler tasks MAY interact with the running BrowserSync
  ;(cfg.prj.compilers || []).forEach((compiler, i) => {
    cfg.compilers[i] = smartRequire('compiler', compiler.type)
      .dev(gulp, compiler, cfg.BrowserSync, cfg.prj.roots.dev)
  })
  installer.save()
}

// add any additional tasks from the devpail config
(cfg.prj.tasks || []).forEach((task, i) => {
  exports[task.name] = (done) => {
    smartRequire('task', task.type).task(gulp, task, cfg.prj.roots)(done)
  }
})

process.on('exit', () => {
  for (var server in cfg.servers) {
    if (server) {
      server.kill()
    }
  }
})
