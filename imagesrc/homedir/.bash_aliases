# This file is part of DevPail (https://github.com/tdesposito/DevPail)
# Copyright(C) Todd D.Esposito 2021.
# Distributed under the MIT License(see https://opensource.org/licenses/MIT).

alias ll='ls -al'
alias less='more'

function init_pail {
    echo -e "\nDevPail(container): Initializing development environment...\n"
    pushd $HOME/app >/dev/null
    cp ../gulpfile.js . >/dev/null 2>&1     # Always get the latest from the container
    [ ! -d local ] && mkdir local
    [ ! -f package.json ] && ln -s src/package.json
    touch src/package-lock.json
    [ ! -f package-lock.json ] && ln -s src/package-lock.json
    npm add --save-dev gulp gulp-rename require-from-url browser-sync
    npm install
    if [ -f src/pyproject.toml ]; then
        pushd src >/dev/null
        poetry export -f requirements.txt --output ../requirements.txt --without-hashes
        popd >/dev/null
    fi
    [ -f requirements.txt ] && pip install --upgrade -r requirements.txt
    popd >/dev/null
    mkdir ~/app/build >/dev/null 2>&1
    mkdir ~/app/dev >/dev/null 2>&1
    echo -e "\nDevelopment environment up to date. Happy Coding!\n"
}

if [ ! -f gulpfile.js ]; then
    init_pail
fi
