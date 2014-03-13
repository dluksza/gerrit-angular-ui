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

Gerrit.install(function(self) {
  /**
   * Url to actuall plugin JS file.
   *
   * URL need be relative to /plugins/$plugin_name/static/
   */
  var pluginFileUrl = 'plugin.js';

  /**
   * List of CSS dependencies
   *
   * Provided URLs needs be relative to /plugins/$plugin_name/static/
   */
  var cssDeps = ['dist/bootstrap-3.1.0.css',];

  /**
   * Additional JavaScript dependencies required by this plugin.
   * They will be automatically injected into document head section
   * during plugin starup.
   *
   * Provided URLs needs be relative to /plugins/$plugin_name/static/
   */
  var additionalJsDeps = [];

  var jqueryVersion = '1.10.2';
  var angularVersion = '1.2.9';

  /** INTERNALS **/
  window['_angularGerritLoadedDeps'] = window['_angularGerritLoadedDeps'] || [];

  var jsDeps = ['dist/jquery-' + jqueryVersion + '.js',
                'dist/angular-' + angularVersion + '.js',
                'dist/angular-route-' + angularVersion + '.js',
                ];
  jsDeps = jsDeps.concat(additionalJsDeps);
  var head = document.getElementsByTagName('head')[0] || document.documentElement;
  var loadScript = function(name) {
    var script = document.createElement('script');
    script.async = false;
    script.type = 'text/javascript';
    script.src = self.url('/static/' + name);
    head.appendChild(script);
  }

  // dynamically inject all CSS into page head
  for (dep in cssDeps) {
    if (window['_angularGerritLoadedDeps'].indexOf(dependency) === -1) {
      window['_angularGerritLoadedDeps'].push(dependency);
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = self.url('/static/' + cssDeps[dep]);
      head.appendChild(link);
    }
  }
  // dynamically inject all JS into page head
  for (dep in jsDeps) {
    var dependency = jsDeps[dep];
    if (window['_angularGerritLoadedDeps'].indexOf(dependency) === -1) {
      window['_angularGerritLoadedDeps'].push(dependency);
      loadScript(dependency);
    }
  }
  // laod Angular Gerrit API
  loadScript('js/angular-gerrit.js');

  var onAngularGerritLoad = function() {
    var angularGerrit = window['AngularGerrit'];
    if (angularGerrit && typeof(angularGerrit) == 'object') {
      angularGerrit.init(self);
      // load main plugin file
      loadScript(pluginFileUrl);
    } else {
      waitForAngularGerrit();
    }
  }
  var waitForAngularGerrit = function() {
    setTimeout(onAngularGerritLoad, 30);
  }
  waitForAngularGerrit();
})
