// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [
  'http-proxy-middleware',
]


exports.build = (gulp, server, name) => {
  // Proxy has NO build stage.
  function proxy_build_noop(done) { done(); }
  return proxy_build_noop
}


exports.dev = (gulp, server, bscfg) => {
  const { createProxyMiddleware } = require('http-proxy-middleware')

  var port = bscfg.port + (server.port || 1)

  var proxycfg = {
    target: `http://localhost:${port}`,
    changeOrigin: true,
    ...(server.proxycfg || {}),
  }
  bscfg.server.middleware.push(createProxyMiddleware(server.entrypoints, proxycfg))
  
  return null   // there's no external server to manage
}
