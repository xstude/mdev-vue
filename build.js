require('shelljs/global');
var path = require('path');
var fs = require('fs');
var child = require('child_process');
var tools = require('nodejs-tools');
var $$common = require('./mdev/common.js');
var vars = $$common.getVars();


var fnBuild = function () {
    var fnPre = function () {
        rm('-rf', `${vars.root}/work`);
        mkdir('-p', `${vars.root}/work`);
        cp('-f', `${vars.root}/mdev/\*`, `${vars.root}/work`);
    };

    var fnPreConfig = function () {
        var projectConfig = fs.readFileSync(`${vars.projectPath}/src/config.json`);
        projectConfig = JSON.parse(projectConfig);

        var webpackConfig = fs.readFileSync(`${vars.root}/mdev/webpack.config.js`, 'utf-8');
        var velocity = require('./mdev/velocity.js');
        webpackConfig = velocity.render(webpackConfig, projectConfig);
        fs.writeFileSync(`${vars.root}/work/webpack.config.js`, webpackConfig, 'utf-8');

        // namespace
        var namespace = projectConfig['namespace'];
        if (typeof namespace !== 'string' ||  namespace === '') {
            namespace = 'uiApp';
        }
        var index = fs.readFileSync(`${vars.root}/mdev/index.js`, 'utf-8');
        index = index.replace('NAMESPACE', namespace);
        fs.writeFileSync(`${vars.root}/work/index.js`, index, 'utf-8');
        var app = fs.readFileSync(`${vars.root}/mdev/app.js`, 'utf-8');
        app = app.replace(/NAMESPACE/g, namespace);
        fs.writeFileSync(`${vars.root}/work/app.js`, app, 'utf-8');
    };

    var fnAction = function (fn) {
        var webpack = require('webpack');
        var webpackConfig = require(`${vars.root}/work/webpack.config.js`);
        
        var args = require('optimist').argv;
        if (args.w === true || args.watch === true) {
            webpackConfig.watch = true;
        }
        
        webpack(webpackConfig, function (error, stats) {
            if (error) {
                console.error(`building failed. \n\n${error}`);
            }
            process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n');
        });
    };

    console.log('building ...');
    fnPre();
    fnPreConfig();
    fnAction();
    console.log('building success.');
};


fnBuild();
