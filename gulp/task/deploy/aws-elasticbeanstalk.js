// This file is part of DevPail (https://github.com/tdesposito/DevPail)
// Copyright(C) Todd D.Esposito 2021.
// Distributed under the MIT License(see https://opensource.org/licenses/MIT).

exports.dependencies = [ 'yaml', 'dotenv' ]
exports.packages = [ 'awsebcli' ]

exports.task = (gulp, cfg, name) => {
    const projectName = require(`${process.cwd()}/package.json`).name
    const config_default = {
        "branch-defaults": {
            main: {
                environment: 'staging',
            },
        },
        global: {
            application_name: `${projectName}-application`,
            default_platform: "Python 3.8 running on 64bit Amazon Linux 2",
            default_region: "us-east-1",
            workspace_type: "Application",
        }
    }
    
    const extensions_default = {
        classic_load_balancer: {
            // 'aws:elb:listener:443'
            ListenerProtocol: 'HTTPS',
            InstancePort: 80,
        },
        rolling_updates: {
            // 'aws:elasticbeanstalk:command':
            DeploymentPolicy: 'Rolling',
            BatchSizeType: 'Percentage',
            BatchSize: 25,
        },
        managed_actions: {
            // 'aws:elasticbeanstalk:managedactions': {
            ManagedActionsEnabled: true,
            PreferredStartTime: "Tue:09:00",
        },
        platform_update: {
            // 'aws:elasticbeanstalk:managedactions:platformupdate'
            UpdateLevel: 'minor',
            InstanceRefreshEnabled: true,
        }
    }
    const extensions_keymap = {
        classic_load_balancer: 'aws:elb:listener:443',
        rolling_updates: 'aws:elasticbeanstalk:command',
        managed_actions: 'aws:elasticbeanstalk:managedactions',
        platform_update: 'aws:elasticbeanstalk:managedactions:platformupdate',
    }

    function configure_eb(done) {
        const fs = require('fs')
        const yaml = require('yaml')
        fs.mkdirSync('build/.elasticbeanstalk')
        fs.writeFileSync(
            'build/.elasticbeanstalk/config.yml', 
            yaml.stringify(gulp.mergeOptions(config_default, cfg.config))
        )
        
        // populate environment config from .env.build
        if (fs.existsSync('src/.env.build')) {
            const envVars = require('dotenv').parse(fs.readFileSync('src/.env.build'))
            const vars = []
            Object.entries(envVars).forEach(([option_name, value]) => {
                vars.push({option_name, value})
            })
            if (!fs.existsSync('build/.ebextensions')) {
                fs.mkdirSync('build/.ebextensions')
            }
            fs.writeFileSync(
                'build/.ebextensions/40-devpail-environment.config',
                yaml.stringify({ option_settings: vars }))
        }

        // populate configuration extensions
        if (cfg.extensions) {
            const all = cfg.extensions.all || {}
            const env = cfg.extensions[env_name] || {}
            const keys = new Set([...Object.keys(all), ...Object.keys(env)])

            const extensions = {}
            keys.forEach(key => {
                extensions[extensions_keymap[key]] = 
                    gulp.mergeOptions(
                        extensions_default[key], 
                        all[key] === true ? {} : all[key],
                        env[key] === true ? {} : env[key]
                    )
            })

            if (!fs.existsSync('build/.ebextensions')) {
                fs.mkdirSync('build/.ebextensions')
            }
            fs.writeFileSync(
                'build/.ebextensions/60-devpail-options.config',
                yaml.stringify({option_settings: extensions})
            )
        }


        done()
    }

    function create_appversion(done) {
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
            cp.execSync(`eb deploy --version ${app_version} ${env_name}`, cp_opts)
        }
        done()
    }

    var env_name = name.split(':')[1] || 'staging'

    if (name.endsWith(':config')) {
        env_name = 'staging'
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

/*eMDocs
This plugin will deploy your project to AWS Elastic Beanstalk.

# Configuration

We provide reasonable defaults for most of the below. You only need to specify
that which is non-default. If you want to apply the defaults as-is, use, for
example, `extensions.staging.rolling_updates: true`

Our *defaults* and parameters **you must define** are noted in square brackets.

* `create` - configures environment creation
    * `elb-type` - ElasticLoadBalancer type  [*classic*]
    * `platform` - the platform identifier; [*python-3.8*] (use `eb platform list` for choices)
    * `region` - deployment region [*us-east-1*]
* `config` - JSON version of the .elasticbeanstalk/config.yml file
    * `branch-defaults.main.environment` - environment when you're on the 'main' branch [*staging*]
    * `global` - global app configuration
        * `application_name` - the EB Application name [*${package.json->name}-application*]
        * `default_platform` - [*Python 3.8 running on 64bit Amazon Linux 2*]
        * `default_region` - [*us-east-1*]
        * `workspace_type` - type of deployment [*Application*]
* `extensions` - configures common .ebextensions options
    * `all` - these are applied to ALL environments
    * `{your-env-name-here}` - these are applied only to the named environment
        * `classic_-_load_-_balancer` - if set, we configure a classic load balancer
            * `ListenerProtocol` [*HTTPS*]
            * `InstancePort` [*80*]
            * `SSLCertificateId` - [**ARN of the certificate to use**]
        * `rolling_updates` - if set, we configure rolling updates
            * `DeploymentPolicy` [*Rolling*]
            * `BatchSizeType` [*Percentage*]
            * `BatchSize` [*25*]
        * `managed_actions` - if set, we configure manged updates (you should set `platform_update` too)
            * `ManagedActionsEnabled` [*true*]
            * `PreferredStartTime` [*Tue:09:00*]
        * `platform_update` - if set, we configure platform updates (you should set `managed-actions` too)
            * `UpdateLevel` [*minor*]
            * `InstanceRefreshEnabled` [*true*]

If you need additional ebextensions, we recommend placing the appropriate
`.config` file(s) into `src/deploy/ebextensions` then using the
`compiler/extra/copy-files` plugin to copy them into `build/.ebextensions` during
the **build** task.
emDocs*/
