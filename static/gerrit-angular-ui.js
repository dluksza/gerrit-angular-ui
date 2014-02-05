var app = angular.module('angular-ui', ['ngRoute']);
app.config(function($routeProvider) {
  var urlPrefix = '/x/angular-ui/';
  var templatePrefix = '/plugins/angular-ui/static/templates/';
  $routeProvider
    .when(urlPrefix + 'q/:query?', {controller: 'QueryCtrl',
                                    templateUrl: templatePrefix + 'query.html'})
    .when(urlPrefix + 'q-b/:query?', {controller: 'QueryCtrl',
                                      templateUrl: templatePrefix + 'query-b.html'});
});
app.controller('QueryCtrl', function($scope, $routeParams, $filter) {
  var query = $routeParams.query || 'status:open';
  $scope.toUrlParameter = function(input) {
    return input.replace(/ /g, '+');
  };
  $scope.fromUrlParameter = function(input) {
    return input.replace(/\+/g, ' ');
  };
  $scope.highlightRow = function(change) {
    $scope.active = change;
  };
  $scope.flipStar = function(change) {
    var url = '/accounts/self/starred.changes/' + change._number;
    var callback = function() {$scope.$apply(function() {change.starred = !change.starred})};
    if (change.starred) {
      Gerrit.delete(url, callback);
    } else {
      Gerrit.put(url, callback);
    }
  };
  $scope.formatStatus = function(change) {
    if (change.status != 'NEW') {
      return change.status;
    } else if (!change.mergable) {
      return 'Merge Conflict';
    }
  }
  $scope.formatUpdatedDate = function(dateStr) {
    var now = new Date();
    var date = new Date(dateStr);
    var format= $filter('date');
    var ONE_YEAR = 182 * 24 * 60 * 60 * 1000;
    var dateMedium = format(date, 'yyyy.MM.dd');
    if (dateMedium == format(now, 'yyyy.MM.dd')) {
      return format(date, 'HH:mm');
    }
    if (now.getTime() - date.getTime() < ONE_YEAR) {
      return format(date, 'MMM d');
    }
    return dateMedium;
  };
  $scope.formatLabel = function(label) {
    var code = '';
    var parts = label.split('-');
    for (var i in parts) {
      code = code + parts[i].substring(0, 1).toUpperCase();
    }
    return code;
  }
  $scope.toLabelScore = function(score) {
    if (score > 0) {
      return '+' + score;
    }
    return score;
  };
  $scope.query = query;
  Gerrit.get('/changes/?q=' + query + '&n=25&O=1', function(changes) {
    var labels = [];
    for (var c in changes) {
      for (var label in changes[c].labels) {
        if (labels.indexOf(label) == -1) {
          labels.push(label);
        }
      }
    }
    labels.sort();
    $scope.$apply(function() {
      $scope.labels = labels;
      $scope.active = changes[0] || {};
      $scope.changes = changes;
    });
  });
});
angular.bootstrap(document, ['angular-ui']);
