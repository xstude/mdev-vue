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
        var child = require('child_process');
        var ec = `node ${vars.projectPath}/node_modules/webpack/bin/webpack.js --config ${vars.root}/work/webpack.config.js`;
        child.exec(ec, function (error, s) {
            if (error) {
                console.log(`building failed. \n\n${error}`);
            }
            console.log(s);
        });
        /*
        if (args.w === true || args.watch === true) {
            ec += ' -w';
        }
        */
    };

    console.log('building ...');
    fnPre();
    fnPreConfig();
    fnAction();
    console.log('building success.');
};


fnBuild();
