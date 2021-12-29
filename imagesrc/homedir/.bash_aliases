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
    npm add --save-dev --no-audit --no-fund gulp gulp-rename require-from-url browser-sync del merge-options
    npm install
    if [ -f src/pyproject.toml ]; then
        if [ ! -f pyproject.toml ]; then
            poetry config virtualenvs.in-project true
            ln -s src/pyproject.toml
            poetry install
        fi
    fi
    mkdir ./build >/dev/null 2>&1
    mkdir ./dev >/dev/null 2>&1
    popd >/dev/null
    echo -e "\nDevelopment environment up to date. Happy Coding!\n"
}

if [ ! -f gulpfile.js ]; then
    init_pail
fi
