// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [
  'webpack',
  'webpack-dev-middleware',
  'webpack-hot-middleware',
]


exports.build = (gulp, server) => {
}


exports.dev = (i, server, bscfg) => {
  const path = require('path')
  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const webpackConfig = require(path.join(process.cwd(), 'webpack.config'))
  const webpackBundler = webpack(webpackConfig)

  bscfg.server.middleware.push(hmrFixupProxy)
  bscfg.server.middleware.push(
    webpackDevMiddleware(webpackBundler, { stats: 'errors-only' })
  )
  bscfg.server.middleware.push(
    webpackHotMiddleware(webpackBundler, { log: false })
  )
  bscfg.files.push(...['site/**/*.css', 'site/**/*.html'])

  return null
}


function hmrFixupProxy(req, res, next) {
  // correct deep paths on reload; ensure our HMR files are served from '/'
  if (! req.url.startsWith('/static')) {
    if (req.url.endsWith('.js') ||
    req.url.endsWith('.map') ||
    req.url.endsWith('.json') ||
    req.url.endsWith('__webpack_hmr')) {
      req.url = '/' + req.url.split('/').slice(-1)[0]
    } else {
      req.url = '/'
    }
  }
  next()
}
