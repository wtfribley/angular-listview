(function(angular) { "use strict";

/**
 * @typedef {Error} ListViewMinErr
 */
var ListViewMinErr = angular.$$minErr('listview');

angular.module('listview', [])

.controller('ListViewCtrl', function() {

})

.directive('listView', function() {
  return {
    restrict: 'EA',
    controller: 'ListViewCtrl'
  };
});

})(angular);
