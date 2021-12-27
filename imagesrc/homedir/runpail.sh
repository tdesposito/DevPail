#!/bin/bash

# Sourcing bash_aliases ensures we init the dev environment, if needed
source ~/.bash_aliases

cd ~/app
gulp "$@"
