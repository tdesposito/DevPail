# This file is part of DevPail (https://github.com/tdesposito/DevPail)
# Copyright(C) Todd D.Esposito 2021.
# Distributed under the MIT License(see https://opensource.org/licenses/MIT).

alias ll='ls -al'
alias less='more'

function init_pail {
    local base_modules=(
        'gulp'
        'gulp-rename'
        'require-from-url'
        'browser-sync'
        'del'
        'merge-options'
        )

    echo -e "\nDevPail(container): Initializing development environment...\n"
    pushd $HOME/app >/dev/null

    # DevPail base setup
    cp ../gulpfile.js . >/dev/null 2>&1     # Always get the latest from the container
    mkdir local build dev deploy >/dev/null 2>&1
    
    # Node setup
    touch src/package-lock.json
    [ ! -f package.json ] && ln -s src/package.json
    [ ! -f package-lock.json ] && ln -s src/package-lock.json
    npm add --save-dev --no-audit --no-fund ${base_modules[*]}
    npm install
    
    # Python setup
    if [ -f src/pyproject.toml ]; then
        if [ ! -f pyproject.toml ]; then
            poetry config virtualenvs.in-project true
            ln -s src/pyproject.toml
            poetry install
        fi
    fi

    popd >/dev/null
    echo -e "\nDevelopment environment up to date. Happy Coding!\n"
}

if [ ! -f gulpfile.js ]; then
    init_pail
fi
