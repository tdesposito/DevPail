import React from "react"
import ReactDOM from "react-dom"

// This fixes an HMR bug (https://github.com/webpack-contrib/webpack-hot-middleware/issues/390).
if (module.hot) { module.hot.accept() }

import Application from './application.jsx'

ReactDOM.render(<Application />, document.getElementById("root"))