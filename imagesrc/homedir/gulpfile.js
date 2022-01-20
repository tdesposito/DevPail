// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

// This gulpfile is a thunk which loads the "real" gulpfile from the CDN.
const requireUrl = require('require-from-url/sync')
const cfg = require('./package.json').devpail || {}
const cdn = cfg.moduleCDN || "https://cdn.jsdelivr.net/gh/tdesposito/DevPail@2/gulp"
const devpail_gulp = requireUrl(`${cdn}/devpail-gulp.js`)

for (var key of Object.keys(devpail_gulp)) {
  exports[key] = devpail_gulp[key]
}
