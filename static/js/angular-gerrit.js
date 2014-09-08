// Copyright (C) 2014 CollabNet
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function() {
'use strict';

var _getModuleName = function(pluginName) {
  return 'angular-gerrit-' + pluginName;
};

/*
 * Initializes AngularGerrit module;
 */
var _initAngularGerrit = function(self) {
  var _screenCtx;
  var _pluginName = self.getPluginName();
  _availablePlugins.push(_pluginName);
  var _moduleName = _getModuleName(_pluginName);
  var _addjustUrl = function(url) {
    return (url.charAt(0)=='/' ? url.substring(1) : url);
  }
  var _wrap = function(promise) {
    promise.success = function(fn) {
      promise.then(function(resp) {
        fn(resp.data, resp.status, resp.headers)
      })
    }
    promise.error = function(fn) {
      prmoise.then(null, function(resp) {
        fn(resp.data, resp.status, resp.headers)
      })
    }
    return promise;
  }

  // catch all screen request in our context
  self.screen(/.*/, function(scrCtx) {
    _screenCtx = scrCtx;
    // just show empy screen,
    // angular will do the needfull here
    scrCtx.show();
  });

  var module = angular.module(_moduleName, ['ng', 'ngRoute']);

  /**
   * Provide Gerrit plugin context aware route service.
   *
   * It is a simple wrapper arrount standard Angular $routeProvider.
   *
   * There is no need to prefix urls wit '/x/$plugin_name/', this
   * provider will handle that for you.
   */
  module.provider('GerritRoute', ['$routeProvider', function($routeProvider) {
    var urlPrefix = '/x/' + _pluginName + '/';
    var templatePrefix = '/plugins/' + _pluginName + '/static/';
    this.prototype = $routeProvider;
    this.when = function(path, route) { // addjust template url
      if (route.templateUrl && route.templateUrl.indexOf(templatePrefix) == -1) {
        route.templateUrl = templatePrefix + _addjustUrl(route.templateUrl);
      }
      if (path.indexOf(urlPrefix) == -1) {
        path = urlPrefix + _addjustUrl(path);
      }
      this.prototype.when(path, route);
      return this;
    }
    this.$get = this.prototype.$get;
  }]);

  /**
   * Wraps generic Gerrit serivce. There is NO plugin context here!
   * For plugin context aware service use GerritPluginSrv.
   *
   * This service simplify usage of global Gerrit REST services
   * (and not only that) automatically wrapping all calls into
   * Angular promise object.
   */
  module.service('GerritSrv', function($q, $rootScope) {
    return {
      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#Gerrit_go
       */
      go: function(url) {
        Gerrit.go(url)
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#Gerrit_refresh
       */
      refresh: function() {
        Gerrit.refresh()
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#Gerrit_showError
       */
      showError: function(errorMsg) {
        Gerrit.showError(errorMsg)
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#Gerrit_onAction
       *
       * Callback function is called in $rootScope.$apply context
       */
      onAction: function(event, view, fn) {
        Gerrit.onAction(event, view, function(a, b) {
          $rootScope.$apply(function() {
            fn(a, b)
          })
        })
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#Gerrit_url
       */
      url: function(url) {
        return Gerrit.url(url);
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#Gerrit_get
       *
       * Retunrs Angular promise object with success and error methods mimicking how $http behaves
       */
      get: function(url) {
        var promise = $q.defer();
        Gerrit.get(url, function(result) {
          promise.resolve(result)
        });
        return _wrap(promise.promise);
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#Gerrit_post
       *
       * Retunrs Angular promise object with success and error methods mimicking how $http behaves
       */
      post: function(url, payload) {
        var promise = $q.defer();
        Gerrit.post(url, payload, function(result) {
          promise.resolve(result)
        });
        return _wrap(promise.promise);
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#Gerrit_put
       *
       * Retunrs Angular promise object with success and error methods mimicking how $http behaves
       */
      put: function(url, payload) {
        var promise = $q.defer();
        Gerrit.put(url, payload, function(result) {
          promise.resolve(result)
        });
        return _wrap(promise.promise);
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#Gerrit_delete
       *
       * Retunrs Angular promise object with success and error methods mimicking how $http behaves
       */
      'delete': function(url) {
        var promise = $q.defer();
        Gerrit.del(url, function(result) {
          promise.resolve(result)
        });
        return _wrap(promise.promise);
      },
    }
  });

  /**
   * GerritPluginSrv wraps plugin specific Gerrit calls.
   * Using this service you can obtain plugin name and issue
   * plugin scoped REST calls (there is no need to provide
   * /plugins/$plugin_name/ prefixes for service URLs)
   */
  module.service('GerritPluginSrv', ['$q', '$rootScope', function($q, $rootScope) {
    return {
      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#self_getPluginName
       */
      getPluginName: function() {
        self.getPluginName()
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#self_on
       *
       * Callback function is called in $rootScope.$apply context
       */
      on: function(type, fn) {
        gerrit.onAction(type, function(actionContext) {
          $rootScope.$apply(function(a, b) {
            fn(a, b);
          })
        });
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#self_onAction
       *
       * Callback function is called in $rootScope.$apply context
       */
      onAction: function(type, view, fn) {
        gerrit.onAction(type, view, function(actionContext) {
          $rootScope.$apply(function() {
            fn(actionContext);
          })
        });
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#self_get
       *
       * Retunrs Angular promise object with success and error methods mimicking how $http behaves
       */
      get: function(url) {
        var promise = $q.defer();
        gerrit.get(url, function(result) {
          promise.resolve(result)
        });
        return _wrap(promise.promise);
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#self_post
       *
       * Retunrs Angular promise object with success and error methods mimicking how $http behaves
       */
      post: function(url, payload) {
        var promise = $q.defer();
        gerrit.post(url, payload, function(result) {
          promise.resolve(result)
        });
        return _wrap(promise.promise);
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#self_put
       *
       * Retunrs Angular promise object with success and error methods mimicking how $http behaves
       */
      put: function(url, payload) {
        var promise = $q.defer();
        gerrit.put(url, payload, function(result) {
          promise.resolve(result)
        });
        return _wrap(promise.promise);
      },

      /**
       * Wrapper arround https://gerrit-review.googlesource.com/Documentation/js-api.html#self_delete
       *
       * Retunrs Angular promise object with success and error methods mimicking how $http behaves
       */
      'delete': function(url) {
        var promise = $q.defer();
        gerrit.del(url, function(result) {
          promise.resolve(result)
        });
        return _wrap(promise.promise);
      },
    }
  }]);

  module.service('GerritScreenSrv', function() {
    return {
      body: function() {
        return _screenCtx.body;
      },

      setTitle: function(title) {
        if (_screenCtx) {
          _screenCtx.setTitle(title);
        }
      },

      setWindowTitle: function(title) {
        if (_screenCtx) {
          _screenCtx.setWindowTitle(title);
        }
      },
    };
  });

  // workaround for '404' page when plugin page
  // is the first to load
  self.refresh();
}

var _bootstrap = function(pluginName) {
  _installedPlugins.push(pluginName);
  if (_availablePlugins.sort().toString() == _installedPlugins.sort().toString()) {
    // angular needs a container with 'ng-view' property
    // to be able to show contents, therefore we create here
    // div conteiner within main gerrit node
    var gerritBody = document.getElementById("gerrit_body");
    var ngView = document.createElement('div');
    ngView.setAttribute('ng-view', '');
    gerritBody.appendChild(ngView);
    // bootstrap Angular!
    angular.bootstrap(document, _installedPlugins);
    // clean up root scope after full initialization
    delete window['_angularGerritLoadedDeps'];
  }
};

var _install = function(additionalModules, pluginCallback) {
  var pluginName = Gerrit.getPluginName();
  var moduleName = _getModuleName(pluginName);
  // this could result in some raceconditions, but I didn't found better
  // solution how to initialize multiple Angular modules dynamically
  setTimeout(function() {
    additionalModules.push(moduleName);
    var app = angular.module(pluginName, additionalModules);
    pluginCallback(app);
    _bootstrap(pluginName);
  }, 1);
};

if (!window['AngularGerrit']) {
  var _availablePlugins = [];
  var _installedPlugins = [];
  window['AngularGerrit'] = {
    /**
     * Initializes all required Angular binding and generates
     * specialized Angular module for this plugin.
     *
     * It is called by AngularGerrit init.js script with
     * GerritPluginApi object as parameter.
     *
     * Users *SHOULD NOT* call this method, unless they are
     * implementing theirs own version of init.js
     */
    init: _initAngularGerrit,

    /**
     * Install angular based plugin.
     *
     * This method takes list of addtional Angualr modules and function
     * with one parameter.
     *
     * Function passed as argument to this method will be later
     * called with plugin module instance.
     *
     * Each Gerrit plugin would have separate AngularGerrit module!
     *
     * When addtional JS (or CSS) dependiencies are required, they can
     * be injected during initialization process. This would require
     * modifications in init.js file.
     *
     * AngularGerrit.install([], function(app) {
     *   // example plugin code
     *   app.config(['GerritRouteProvider', function(GerritRouteProvider) {}]);
     *   app.controller('Ctrl', [function () {}]);
     * });
     */
    install: _install,
  }
}
})();
