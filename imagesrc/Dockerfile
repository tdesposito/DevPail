# syntax=docker/dockerfile:1

# This file is part of DevPail (https://github.com/tdesposito/DevPail)
# Copyright (C) Todd D. Esposito 2021.
# Distributed under the MIT License (see https://opensource.org/licenses/MIT).

#------------------------------------------------------------------------------
# Our default production target is ElasticBeanstalk - AmazonLinux2 w/ python3.8
# or NodeJS14, but you can override that with the `BASEIMAGE` and `IMAGETAG`
# args.
ARG BASEIMAGE=nikolaik/python-nodejs
ARG IMAGETAG=python3.8-nodejs14

FROM --platform=linux/amd64 ${BASEIMAGE}:${IMAGETAG}

#------------------------------------------------------------------------------
# Our default base image creates a `pn` user; update this if you use a different
# image
ARG USER=pn
ARG HOMEDIR=/home/${USER}

#------------------------------------------------------------------------------
# By default, we expect the tooling volume to mount at ~/app
ARG TOOLMOUNT=${HOMEDIR}/app

# And we expect the project source to mount at ~/app/src
ARG SOURCEMOUNT=${TOOLMOUNT}/src

SHELL ["/bin/bash", "-c"]

RUN python -m pip install --upgrade pip

RUN npm install -g npm && \
    npm install --global gulp-cli

ENV PYTHONPATH="${TOOLMOUNT}/site-packages"
ENV NODE_PATH="${TOOLMOUNT}/node_modules/bin"

USER ${USER}
COPY --chown=1000:1000 homedir/* ${HOMEDIR}
WORKDIR ${TOOLMOUNT}
RUN chown 1000:1000 ${TOOLMOUNT}

EXPOSE 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009

#------------------------------------------------------------------------------
# We use GulpJS to manage development; the default task spins up a BrowserSync
# instance for your project and whichever additional watchers, servers and
# processes are needed during development. These are defined in your
# `package.json` under `devpail`.
#
# You can pass task names (and other arguments) to the `devpail` command. For
# example, pass `build` or `publish` to run those tasks.
ENTRYPOINT [ "/bin/bash", "-c", "gulp" ]
