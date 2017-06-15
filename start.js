var fs = require('fs');
var $$common = require('./mdev/common.js');
var vars = $$common.getVars();
var port;

var fnPre = function () {
    var projectConfig = fs.readFileSync(`${vars.projectPath}/src/config.json`);
    projectConfig = JSON.parse(projectConfig);

    // server.js
    var server = fs.readFileSync(`${vars.root}/mdev/server.js`, 'utf-8');
    port = projectConfig['port'];
    if (typeof port !== 'number') {
        port = 4000;
    }
    server = server.replace('SERVER_ROOT', `${vars.projectPath}/dist`);
    server = server.replace('SERVER_PORT', port);
    var proxyList = projectConfig['proxy-list'];
    if (proxyList instanceof Array !== true) {
        proxyList = [];
    }
    server = server.replace('PROXY_LIST', JSON.stringify(proxyList, null, 4));
    fs.writeFileSync(`${vars.root}/work/server.js`, server, 'utf-8');
};

var vars = $$common.getVars();
console.log('start server ...');
fnPre();
require(`${vars.root}/work/server.js`);
console.log(`start server success. [port: ${port}]`);
