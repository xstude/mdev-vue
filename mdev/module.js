var moduleView = require('./temp/register-module.js');
var moduleMap = require('./temp/module-map.js');


var getModuleInstance = function (name) {
    var appendChild = function () {
        var children = this.children;
        children.forEach(function (item) {
            var m = getModuleInstance(item);
            var wrapperIds = moduleView[item].wrapperIds;
            var i, id, dom;
            for (i = 0; i < wrapperIds.length; i++) {
                id = wrapperIds[i];
                dom = document.getElementById(id);
                if (dom) {
                    m.appendTo(dom);
                    m.appendChild();
                    break;
                }
            }
        });
    };

    var appendTo = function (dom) {
        var _this = this;
        if (!dom) {
            return;
        }
        if (!_this.instance.$el) {
            m.instance.$mount();
        }
        dom.appendChild(_this.instance.$el);
    };

    var m = moduleMap[name];
    if (!m) {
        throw 'can\\\'t find module "' + name + '"';
    }
    if (m.appendChild) {
        return m;
    }
    m.instance = m.instance;
    m.appendChild = appendChild;
    m.appendTo = appendTo;
    m.events = {};

    return m;
};


exports.getModuleInstance = getModuleInstance;
