Gerrit.install(function(self) {
  var jsDeps = ['dist/jquery-1.10.2.js',
                'dist/angular-1.2.9.js',
                'dist/angular-route-1.2.9.js',
                'gerrit-angular-ui.js'];
  var cssDeps = ['dist/bootstrap-3.1.0.css',];
  var head = document.getElementsByTagName('head')[0] || document.documentElement;

  // dynamically inject all CSS into page head
  for (dep in cssDeps) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = self.url('/static/' + cssDeps[dep]);
    head.appendChild(link);
  }
  // dynamically inject all JS into page head
  for (dep in jsDeps) {
    var script = document.createElement('script');
    script.async = false;
    script.type = 'text/javascript';
    script.src = self.url('/static/' + jsDeps[dep]);
    head.appendChild(script);
  }
  // angular needs a container with 'ng-view' property
  // to be able to show contents, therefore we create here
  // div conteiner within main gerrit node
  var gerritBody = document.getElementById("gerrit_body");
  var ngView = document.createElement('div');
  ngView.setAttribute('ng-view', '');
  gerritBody.appendChild(ngView);

  // catch all screen request in our context
  self.screen(/(.*)/, function(scrCtx) {
    // just show empy screen,
    // angular will do the needfull here
    scrCtx.show();
  });
});
