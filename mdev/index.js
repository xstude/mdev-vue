var Vue = require('./vue.js');


require('./temp/global-library.js');


var $$memoryRouter = require('./memory-router.js');
var $$widget = require('./widget.js');
var $$module = require('./module.js');
var $$ev = require('./ev.js');


var app = Vue.extend({
    template: '<router-view />',
    mounted: function () {
        var _this = this;
        _this.$router.pushState('/');
    }
});


var ui = {
    constructor: app,
    evt: {
        on: function (moduleName, eventName, fn) {
            $$ev.on(moduleName, eventName, fn);
        },
        off: function () {
            $$ev.off(moduleName, eventName, fn);
        }
    },
    router: {
        getRoute: function () {
            return $$memoryRouter.getRoute();
        },
        get: function () {
            return $$memoryRouter.get();
        },
        pushState: function (toLocation) {
            $$memoryRouter.pushState(toLocation);
        },
        on: function (fn) {
            $$memoryRouter.on(fn);
        },
        off: function (fn) {
            $$memoryRouter.off(fn);
        }
    }, 
    getModule: function (name) {
        var module = $$module.getModuleInstance(name);
        var m = {
            get: function (key) {
                return JSON.parse(JSON.stringify(module.instance.$data));
            },
            set: function (key, val) {
                if (typeof key === 'string') {
                    module.instance[key] = val;
                }
                if (key instanceof Object === true) {
                    for (var k in key) {
                        module.instance[k] = key[k];
                    }
                }
            }
        };
        return m;
    }
};


window['NAMESPACE'] = ui;
