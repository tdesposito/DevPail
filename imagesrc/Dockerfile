# syntax=docker/dockerfile:1

# This file is part of DevPail (https://github.com/tdesposito/DevPail)
# Copyright (C) Todd D. Esposito 2021.
# Distributed under the MIT License (see https://opensource.org/licenses/MIT).

#------------------------------------------------------------------------------
# Our default production target is ElasticBeanstalk - AmazonLinux2 w/ python3.8
# or NodeJS14. 
#
# You can override that with various combinations of the `BASEIMAGE`, `PYVER`,
# `NODEVER` and `IMAGETAG` args.
ARG BASEIMAGE=nikolaik/python-nodejs
ARG PYVER=3.8
ARG NODEVER=14
ARG IMAGETAG=python${PYVER}-nodejs${NODEVER}

FROM --platform=linux/amd64 ${BASEIMAGE}:${IMAGETAG}

RUN npm install --global gulp-cli

SHELL ["/bin/bash", "-c"]

#-------------------------------------------------------------------------------
# Our default base image creates a `pn` user; update this if you use a different
# image
ARG USER=pn
ARG USERID=1000
ARG GRPID=1000
ARG HOMEDIR=/home/${USER}

#-------------------------------------------------------------------------------
# By default, we expect the tooling volume to mount at ~/app
ARG TOOLMOUNT=${HOMEDIR}/app

ARG PYVER
ENV PYTHONROOT="${TOOLMOUNT}/local"
ENV NODE_PATH="${TOOLMOUNT}/node_modules/.bin"
ENV PATH="/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PYTHONROOT}/bin:${NODE_PATH}"

USER ${USER}
COPY --chown=${USERID}:${GRPID} homedir/* ${HOMEDIR}
WORKDIR ${TOOLMOUNT}
RUN chown ${USERID}:${GRPID} ${TOOLMOUNT} && \
    ln -sf ${TOOLMOUNT}/local ${HOMEDIR}/.local

EXPOSE 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009

#-------------------------------------------------------------------------------
# We use GulpJS to manage development; the default task spins up a BrowserSync
# instance for your project and whichever additional watchers, servers and
# processes are needed during development. These are defined in your
# `package.json` under `devpail`.
#
# You can pass task names (and other arguments) to the `devpail` command. For
# example, pass `build` or `publish` to run those tasks instead.
ENTRYPOINT [ "/home/pn/runpail.sh" ]
CMD ["default"]
