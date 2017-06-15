var path = require('path');
var nodeServer = require('nodejs-server');


var root = 'SERVER_ROOT';
var nserver = new nodeServer(root, SERVER_PORT);


nserver.config({
    proxy: true
});

nserver.config({
    allowExtension: [ '.woff', '.eot', '.cur', '.map', '.png', '.txt', '.swf' ]
});


nserver.config({
    proxyList: PROXY_LIST
});


nserver.config({
    allowExtension: [ '.woff' ]  // 开放文件通过
});


nserver.start();
