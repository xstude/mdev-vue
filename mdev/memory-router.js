var Vue = require('./vue.js');
var fnRegisterRouter = function () {
    Vue.component('router-view', {
        template: '<div v-bind:id="id" v-bind:name="name"></div>',
        props: {
            name: {
                type: String,
                default: 'default'
            }
        },
        computed: {
            id: function () {
                return 'router-view-' + Math.random();
            }
        },
        beforeMount: function () {
            var _this = this;
            var uid = _this.$parent._uid;
            if (!rootUid) {
                rootUid = uid;
            }
            routerView[uid] = routerView[uid] || {};
            routerView[uid][_this.name] = _this.id;
        }
    });

    Vue.component('router-link', {
        template: '<a href="javascript:;" @click="locationTo"><slot></slot></a>',
        props: {
            href: {
                type: String,
                default: '/'
            }
        },
        computed: {
            url: function () {
                var _this = this;
                if (!_this.href.match(/^\//)) {
                    console.error('error href');
                    return '/';
                }
                return _this.href;
            }
        },
        methods: {
            locationTo: function () {
                var _this = this;
                _this.$router.pushState(_this.url);
            }
        }
    });

    Vue.use({
        install: function (Vue) {
            Object.defineProperty(Vue.prototype, '$route', {
                get: function get () {
                    return fnProcessLocation(locationHref);
                }
            });
            Object.defineProperty(Vue.prototype, '$router', {
                get: function get () {
                    return router;
                }
            });
        }
    });
};


var T = function (router) {
    var outer = function (root) {
        var routers = [];
        if (!root.children || !root.children.length) {
            if (typeof root.redirect === 'string') {
                routers.push({
                    path: root.path,
                    redirect: root.redirect
                });
            } else {
                routers.push({
                    path: root.path,
                    components: [root.component]
                });
            }
        } else {
            root.children.forEach(function (child) {
                var list = outer(child);
                list.forEach(function (item) {
                    var path = (root.path === '/' ? '/' : (root.path + '/')) + item.path;
                    if (typeof item.redirect === 'string') {
                        routers.push({
                            path: path,
                            redirect: item.redirect
                        });
                    } else {
                        item.components.unshift(root.component);
                        routers.push({
                            path: path,
                            components: item.components
                        });
                    }
                });
            });
        }
        return routers;
    };

    if (Object.prototype.toString.call(router) === '[object Array]') {
        var re = [];
        router.forEach(function (r) {
            outer(r).forEach(function (i) {
                re.push(i);
            });
        });
        return re;
    } else {
        return outer(router);
    }
};


var removeChild = function (dom) {
    var children = dom.childNodes;
    var i;
    for (i = 0; i < children.length; i++) {
        dom.removeChild(children[i]);
    }
};


var fnMount = function (components, index, dom) {
    var $$module = require('./module.js');
    var m = $$module.getModuleInstance(components[index]);
    removeChild(dom);
    m.appendTo(dom);
    m.appendChild();

    var _this = this;
    var uid = m.instance._uid;
    if (routerView[uid] instanceof Object === false) {
        return;
    }

    var domId = routerView[uid].default;
    var dom = document.getElementById(domId);
    if (index < components.length - 1) {
        fnMount(components, index + 1, dom);
    }
};


var fnProcessLocation = function (location) {
    if (typeof location !== 'string') {
        return;
    }
    if (!location.match(/^\//)) {
        return;
    }

    var fnGetPQ = function () {
        var queryString = {};
        var arr = location.split('?');
        var path = arr[0];
        var q = arr[1] || '';
        q = q.split('&');
        q.forEach(function (item) {
            var arr = item.split('=');
            if (arr[0] !== '') {
                queryString[arr[0]] = arr[1];
            }
        });
        route.path = path;
        route.query = queryString;
    };

    var fnAdapter = function (path) {
        var fnGetParams = function (s) {
            var arr = s.split('/');
            var params = [];
            arr.forEach(function (item) {
                if (!item.match(/^:/)) {
                    return;
                }
                params.push(item);
            });
            return params;
        };

        var fnGetReg = function (s) {
            var params = fnGetParams(s);
            params.forEach(function (item) {
                s = s.replace(item, '(.*?)');
            });
            return new RegExp('^' + s + '$');
        };

        var fnGetParamsValue = function (path, matched) {
            var arr1 = path.split('/');
            var arr2 = matched.split('/');
            var params = {};
            arr1.forEach(function (item, i) {
                if (arr2[i] === arr1[i]) {
                    return;
                }
                if (typeof arr2[i] === 'string' && arr2[i].split(':')[1]) {
                    params[arr2[i].split(':')[1]] = arr1[i];
                }
            });
            return params;
        };

        var routeMap = require('../../../src/ui/route.json');
        var routeFormatMap = T(routeMap);
        var current = null;
        var i, item, reg;
        for (i = 0; i < routeFormatMap.length; i++) {
            item = routeFormatMap[i];
            reg = fnGetReg(item.path);

            if (path.match(reg)) {
                current = item;
                break;
            }
        }

        route.params = fnGetParamsValue(path, current.path);
        route.matched = current;
    };

    var route = {};
    fnGetPQ();
    fnAdapter(route.path);

    return route;
};


var locationHref = '';
var routerView = {};
var rootUid;
var evtFns = [];


var router = {
    getRoute: function () {
        return fnProcessLocation(locationHref);
    },
    get: function () {
        return locationHref;
    },
    on: function (fn) {
       evtFns.push(fn); 
    },
    off: function (fn) {
        var i;
        for (i = 0; i < evtFns.length; i++) {
            if (evtFns[i] === fn) {
                break;
            }
        }
        evtFns = evtFns.slice(0, i).concat(evtFns.slice(i + 1));
    },
    pushState: function (location) {
        if (location === locationHref) {
            return;
        }

        locationHref = location;

        evtFns.forEach(function (item) {
            item();
        });

        var _this = this;
        var $route = _this.getRoute(locationHref);
        if ($route.matched.redirect) {
            _this.pushState($route.matched.redirect);
            return;
        }

        var uid = rootUid;
        var domId = routerView[uid].default;
        var dom = document.getElementById(domId);

        fnMount($route.matched.components, 0, dom);
    }
};


fnRegisterRouter();


module.exports = router;
