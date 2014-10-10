(function(angular) {
  'use strict';

  /**
   * @typedef {Error} ListViewMinErr
   */
  var ListViewMinErr = angular.$$minErr('listview');

  angular.module('listview', [])

.controller('ListViewCtrl', function() {

  this.selectMode = 'none';

})

.directive('listView', function() {

  var SELECT_MODES = {
    single: 'single',
    multi: 'multi',
    active: 'active',
    none: 'none'
  };

  return {
    restrict: 'EA',
    controller: 'ListViewCtrl',
    link: function(scope, $element, attrs, ctrl) {

      // the controller will arbitrate selection - it needs to know the mode.
      ctrl.selectMode = SELECT_MODES[attrs.selectMode] || 'none';
    }
  };
})

.directive('listItem', function() {
  return {
    restrict: 'EA',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {

      // a particular event may be specified for selection.
      var selectEvent = (ctrl.selectMode == 'none')
        ? null
        : attrs.selectOn || 'click';
    }
  };
});

})(angular);
