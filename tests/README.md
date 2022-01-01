# DevPail testing rigs

Here we have testing rigs for various DevPail configurations.

* `basic` - vanilla html, css and js
* `flask` - a Flask-based site, with css and js
* `sass` - same as `basic` but with sass support
* **TODO** `webpack` - a webpack (react?) site

## Running the tests

There are no automated tests here; they're all interactive.

1. Run a basic web server in the `gulp` directory to serve the local versions of the Gulp task modules
    * a simple `npx http-server` will work
    * or, may I suggest [ehMDServer](https://github.com/tdesposito/EH-mdServer)
1. In the directory of the individual test you want to run the usual `devpail --shell`
1. Inside the DevPail shell, run `gulp`
1. Open one or more browser windows connected to the DevPail server
1. Edit the various source files inside the test directory and watch the changes
1. If you edit any Gulp task modules, you'll have to kill (ctrl-c) the running `gulp` process and restart it
