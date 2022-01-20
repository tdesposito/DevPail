# DevPail - a bucket of development tooling

This README is for version *2.0.0-alpha.0*.

[![GitHub package.json version (main)](https://img.shields.io/github/package-json/v/tdesposito/DevPail/main?label=Version)](https://github.com/tdesposito/DevPail)
[![npm](https://img.shields.io/npm/v/devpail)](https://npmjs.org/package/devpail)
![License](https://img.shields.io/github/license/tdesposito/DevPail)
![npm](https://img.shields.io/npm/dm/devpail)

**DevPail** is what you carry all your DevTools in.  <img align="right" alt="DevPail Logo" src="images/devpail-logo-150x205.png">

**DevPail** builds flexible [Docker](https://docker.com) container and
[GulpJS](https://gulpjs.com) task runner combinations which isolate and
encapsulate your projects' development environments, so you don't have to.

You don't need to write a custom Gulpfile for each project, but instead configure the operation of Gulp via directives in `package.json` which enable various plugins.

## Installation

Before you use **DevPail**, you will need a working installation of [Docker](https://www.docker.com).

Since **DevPail** can (should?) be used across multiple projects, it's best to install it globally:

```console
$ npm install --global devpail
```

If you intend modify the code before use:

```console
$ git clone https://github.com/tdesposito/DevPail.git
$ cd DevPail
$ npm link .
```

## Usage

Before you can start using **DevPail**, you'll need to build at least the default image (python3.8/node14):

```console
$ devpail --build
DevPail: Building image "devpail:default"...
... lots of stuff happens ...
```

You can pass Docker ARG parameters directly on the above to customize the build.
You only have to do this once, in general. More on that soon.

To initialize your project, in the top-level project directory (where your
`package.json` and other project files are):

```console
$ devpail --init
DevPail: Setting defaults for your project...
```

Now move on to configuration. Oh, look, that's right here!

## Configuration

Configuration for your **DevPail** is kept under the `devpail` key in your
`package.json` file. You can use `devpail --init` to provide you with a
skeleton.

### Ports

Our docker image exposes ports 3000-3009. 3000 is always a browser-sync server,
and 3009 is the browser-sync UI. Use of the remaining ports is optional and
application-specific. You specify which you want mapped onto your local ports
as:

```json
"devpail": {
    "ports": [ "3000:3000", "3009:3009" ]
}
```

This makes the container's browser-sync available as `localhost:3000`, and the
browser-sync UI as `localhost:3009`. **You MUST list the container's port 3000
FIRST or you'll break BrowserSync.**

### Compilers and Servers

In **DevPail**'s parlance, _Server_ and _Compiler_ objects manage distinct parts
of the development and build process.

**MORE TO COME** This section needs much work.

They are configured in the same way:
```JSON
"devpail": {
    "<compilers|servers>": [
      {
        "type": "<compiler-type | server-type>",
        "parallel": <false | true>,
        "config": {
          "all": {...},
          "dev": {...},
          "build": {...}
        },
        "<other-config-keys>": ...
      }
    ]
}
```

## Running the development environment

To run the environment, once configured:

```console
$ devpail
```

Voila.

## TODO: More to work on

* List of servers
* List of compilers
* List of tasks
* Developing servers/compilers/tasks
