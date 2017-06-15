var getUserDirectory = function () {
    var child = require('child_process');
    var platform = process.platform + '-' + process.arch;

    var ec;
    if (platform === 'win32-x64') {
        ec = 'echo %HOMEDRIVE%%HOMEPATH%';
    } else {
        ec = 'cd ~ && pwd';
    }

    var ecl = child.execSync(ec);

    return ecl.toString().replace(/\\/g, '/').replace(/\r/g, '').replace(/\n/g, '');
};


var fnGetVars = function () {
    require('shelljs/global');
    var fs = require('fs');
    var path = require('path');
    var platform = process.platform + '-' + process.arch;

    var root = path.resolve(__dirname, '../').replace(/\\/g, '/');
    var projectPath = path.resolve('./').replace(/\\/g, '/');

    var projectConfig = fs.readFileSync(`${projectPath}/src/config.json`);
    var projectTemplate = JSON.parse(projectConfig)['mdev-template'];
    var userDirectory = getUserDirectory();
    var mdevDirectory = `${userDirectory}/mdev/work`;
    if (platform === 'win32-x64') {
        mdevDirectory = '/mdev';
    }

    var projectWorkPath = `${mdevDirectory}/${projectTemplate}/work/${encodeURIComponent(projectPath)}`;
    mkdir('-p', projectWorkPath);

    var node;
    if (platform === 'win32-x64') {
        node = `${root}/node/${platform}/node.exe`;
    } else {
        node = `${root}/node/${platform}/bin/node`;
    }
    node = process.argv[0];

    return {
        root: root,
        platform: platform,
        template: projectTemplate,
        node: node,
        projectPath: projectPath,
        mdevDirectory: mdevDirectory,
        projectWorkPath: projectWorkPath
    };
};


var fnMkLink = function (opath, dpath) {
    var platform = process.platform + '-' + process.arch;
    var child = require('child_process');
    var ec;
    if (platform === 'win32-x64') {
        ec = 'mklink /J ' + `"${dpath}" "${opath}"`.replace(/\//g, '\\');
    } else {
        ec = 'ln -s ' + `${opath} ${dpath}`.replace(/\\/g, '/');
    }
    child.execSync(ec);
};


var fnGetTool = function () {
    var platform = process.platform + '-' + process.arch;
    var tar, gzip;
    var vars = fnGetVars();

    if (platform === 'win32-x64') {
        tar = `${vars.root}/tool-tar/${platform}/tar`;
        gzip = `${vars.root}/tool-tar/${platform}/gzip`;
    } else {
        tar = 'tar';
        gzip = 'gzip';
    }

    return {
        tar: tar,
        gzip: gzip
    };
};

module.exports = {
    mkLink: fnMkLink,
    getVars: fnGetVars,
    fnGetTool: fnGetTool
};
