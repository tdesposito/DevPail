// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [ 'yaml', 'dotenv' ]
exports.packages = [ 'awsebcli' ]

exports.task = (gulp, cfg, name) => {
    const projectName = require(`${process.cwd()}/package.json`).name
    const default_config = {
        "branch-defaults": {
            "staging": {
                "environment": `${projectName}-staging`
            },
            "production": {
                "environment": `${projectName}-production`
            }
        },
        "global": {
            "application_name": `${projectName}-application`,
            "default_platform": "Python 3.8 running on 64bit Amazon Linux 2",
            "default_region": "us-east-1",
            "workspace_type": "Application"
        }
    }

    function configure_eb(done) {
        const fs = require('fs')
        const yaml = require('yaml')
        fs.mkdirSync('build/.elasticbeanstalk')
        fs.writeFileSync(
            'build/.elasticbeanstalk/config.yml', 
            yaml.stringify(gulp.mergeOptions(default_config, cfg.config))
        )
        
        if (cfg.extensions?.clb) {
            if (!fs.existsSync('build/.ebextensions')) {
                fs.mkdirSync('build/.ebextensions')
            }
            fs.writeFileSync(
                'build/.ebextensions/securelistener-clb.config',
                yaml.stringify({
                    option_settings: {
                        "aws:elb:listener:443": {
                            ListenerProtocol: "HTTPS",
                            InstancePort: 80,
                            SSLCertificateId: cfg.extensions.clb[env_name]
                        }
                    }
                })
            )
        }

        // auto-populate environment.config from .env.build
        if (fs.existsSync('src/.env.build')) {
            const envVars = require('dotenv').parse(fs.readFileSync('src/.env.build'))
            const environConfig = { option_settings: [] }
            Object.entries(envVars).forEach(e => {
                environConfig.option_settings.push({option_name: e[0], value: e[1]})
            })
            if (!fs.existsSync('build/.ebextensions')) {
                fs.mkdirSync('build/.ebextensions')
            }
            fs.writeFileSync('build/.ebextensions/environment.config', yaml.stringify(environConfig))
        }
        done()
    }

    function create_appversion(done) {
        console.log(`DevPail: Creating application version "${app_version}"...`)
        cp.execSync(`eb appversion --create --label ${app_version}`, cp_opts)
        done()
    }

    function deploy_to_eb(done) {
        default_create = {
            "elb-type": "classic",
            "platform": "python-3.8",
            "region": "us-east-1"
        }
        if (cp.spawnSync('eb', ['status', env_name], cp_opts).status > 0) {
            const opts = Object.entries(
                gulp.mergeOptions(default_create, cfg.create))
                .flatMap(e => `--${e[0]} ${e[1]}`).join(' ')
            console.log(`DevPail: Creating environment "${env_name}"...`)
            cp.execSync(`eb create ${env_name} --version ${app_version} ${opts}`, cp_opts)
        } else {
            console.log(`DevPail: Deploying ${app_version} to environment "${env_name}"...`)
            cp.execSync(`eb deploy --label ${app_version} ${env_name}`, cp_opts)
        }
        done()
    }

    const env_name = name.split(':')[1] || 'staging'

    if (name.endsWith(':config')) {
        return gulp.series(configure_eb)
    }

    const cp = require('child_process')
    const cp_opts = {
        cwd: `${process.cwd()}/build`,
        shell: '/bin/bash',
        stdio: 'inherit',
    }
    const version = require(`${process.cwd()}/package.json`).version
    const app_version = `v${version}-${Math.floor(Date.now() / 1000)}`

    return gulp.series('build', configure_eb, create_appversion, deploy_to_eb) 
}