var pool = {};

module.exports = {
    on: function (mname, key, fn) {
        if (typeof fn !== 'function') {
            return;
        }

        var $$moduleMap = require('./temp/module-map.js');
        if (!$$moduleMap[mname]) {
            return;
        }

        pool[mname] = pool[mname] || {};
        pool[mname][key] = pool[mname][key] || [];
        pool[mname][key].push(fn);
    },
    off: function (mname, key, fn) {
        if (typeof fn !== 'function') {
            return;
        }

        var $$moduleMap = require('./temp/module-map.js');
        if (!$$moduleMap[mname]) {
            return;
        }

        console.log('not supported');
    },
    trigger: function (mname, key) {
        pool[mname] = pool[mname] || {};
        var fns = pool[mname][key] || [];
        fns.forEach(function (fn) {
            fn();
        });
    },
    triggerNext: function (mname, key, next, args) {
        args = [].slice.call(args, 0);
        pool[mname] = pool[mname] || {};
        var fns = pool[mname][key] || [];
        var i = 0;
        var execFn = function () {
            if (i >= fns.length) {
                (function () {
                    var $$moduleMap = require('./temp/module-map.js');
                    var context = $$moduleMap[mname].instance;
                    next.apply(context, args);
                }());
                return;
            }

            var fn = fns[i];
            i++;
            fn.apply(null, [execFn].concat(args));
        };
        execFn();
    }
};

window.lx = pool;
