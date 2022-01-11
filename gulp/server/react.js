// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [
  'webpack',
  'webpack-dev-middleware',
  'webpack-hot-middleware',
  '@pmmmwh/react-refresh-webpack-plugin',
  'html-webpack-plugin',
  'react-refresh',
  'babel-loader',
  '@babel/core', '@babel/preset-env', '@babel/preset-react',
  'style-loader', 'css-loader',
]

function getBaseConfig(isDevMode, server) {
  return {
    mode: isDevMode ? 'development' : 'production',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: `${process.cwd()}/src/${server.source || 'reactapp'}`,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { development: isDevMode, runtime: 'automatic' }],
              ],
              plugins: (isDevMode ? ['react-refresh/babel'] : []),
            }
          }
        },
        {
          test: /\.css$/i,
          include: `${process.cwd()}/src/${server.source || 'reactapp'}`,
          use: ['style-loader', 'css-loader'],
        }
      ],
    },
    output: {
      filename: 'bundle.min.js',
      publicPath: '/',
      path: `${process.cwd()}/${isDevMode ? 'dev' : 'build'}/static/reactapp`,
    },
  }
}

exports.build = (gulp, server) => {
  function build_react_bundle(done) {
    return webpackCompiler.run(done)
  }
  process.env.NODE_ENV = 'production'
  const webpack = require('webpack')
  const HtmlWebpackPlugin = require('html-webpack-plugin')

  const build_config = {
    entry: `${process.cwd()}/src/${server.source || 'reactapp'}/index.js`,
    output: {
      publicPath: '/static/reactapp',
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: `${process.cwd()}/build/index.html`,
        template: `${process.cwd()}/src/${server.source || 'reactapp'}/index.html`,
      }),
    ],
  }

  const config = gulp.mergeOptions(getBaseConfig(false, server), build_config, server.config?.all || {}, server.config?.dev || {})
  const webpackCompiler = webpack(config)

  return build_react_bundle
}


exports.dev = (gulp, server, bscfg) => {
  process.env.NODE_ENV = 'development'
  const webpack = require('webpack')
  const WebpackDevMiddleware = require('webpack-dev-middleware')
  const WebpackHotMiddleware = require('webpack-hot-middleware')
  const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
  const HtmlWebpackPlugin = require('html-webpack-plugin')

  const dev_config = {
    devtool: 'source-map',
    entry: [
      'webpack-hot-middleware/client',
      `${process.cwd()}/src/${server.source || 'reactapp'}/index.js`,
    ],
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshPlugin({
        overlay: { sockIntegration: 'whm' }
      }),
      new HtmlWebpackPlugin({
        filename: `${process.cwd()}/dev/index.html`,
        template: `${process.cwd()}/src/${server.source || 'reactapp'}/index.html`,
      }),
    ],
    watch: true,
    watchOptions: {
      poll: 500,
    }
  }

  const config = gulp.mergeOptions(getBaseConfig(true, server), dev_config, server.config?.all || {}, server.config?.dev || {})
  const webpackCompiler = webpack(config, (err, stat) => {})

  // bscfg.server.middleware.push(hmrFixupProxy)
  bscfg.server.middleware.push(
    WebpackDevMiddleware(webpackCompiler, 
      {
        stats: 'errors-only',
        publicPath: '/',
        writeToDisk: true,
      }
    )
  )
  bscfg.server.middleware.push(
    WebpackHotMiddleware(webpackCompiler, 
      {
        path: '/__webpack_hmr',
        heartbeat: 10 * 1000
      }
    )
  )

  // bscfg.files.push(`${process.cwd()}/src/${server.source || 'reactapp'}/**/*.[tj]sx?`)

  return null   // there's no external server to manage
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
