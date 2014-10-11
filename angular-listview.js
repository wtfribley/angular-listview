(function(angular) {
  'use strict';

  /**
   * @typedef {Error} ListViewMinErr
   */
  var ListViewMinErr = angular.$$minErr('listview');

  angular.module('listview', [])

.controller('ListViewCtrl', function() {

  this.selectMode = 'none';
  this.selectScopes = [];

  /**
   * @ngdoc method
   * @name listView.ListViewCtrl#select
   * @kind function
   *
   * @description
   * Select a given **scope**, using the controller's **selectMode**.
   *
   *  - A selectMode of "none" prevents selection.
   *  - "single" or "active" allows only one scope to be selected at a time.
   *  - "multi" allows many scopes to be selected.
   *
   * @param {obj} scope The scope to select.
   */
  this.select = function select(scope) {
    var selectMode = this.selectMode;

    if (selectMode == 'none') return;

    if (selectMode == 'single' || selectMode == 'active') {
      for (var i = 0, len = this.selectScopes.length; i < len; i++) {
        this.selectScopes[i].$selected = false;
      }
    }

    scope.$selected = true;
    if (selectMode == 'active') scope.$active = true;
  };
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

.directive('listEdit', function() {
  return {
    restrict: 'EA',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {

    }
  };
})

.directive('listAdd', function() {
  return {
    restrict: 'EA',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {

    }
  };
})

.directive('listItem',
['$parse', '$q', '$timeout', function($parse, $q, $timeout) {
  return {
    restrict: 'EA',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {

      // a particular event may be specified for selection.
      var selectEvent = (ctrl.selectMode == 'none')
        ? null
        : attrs.selectOn || 'click';

      if (selectEvent) {
        var handler = function() { return true; };
        var timer = null;

        scope.$selected = false;
        if (ctrl.selectMode == 'active') scope.$active = false;

        // register the scope with the controller, allowing it to control
        // selection across the whole list.
        ctrl.selectScopes.push(scope);

        // the select function can return an explicit false to prevent selection.
        if (attrs.selectFn) handler = $parse(attrs.selectFn);

        // to provide compatibility with the other directives, the click handler
        // is debounced so as to only fire once even on a double click.
        $element.on(selectEvent, function(event) {
          event.stopPropagation();

          if (selectEvent == 'click') {
            var callFn = !timer;
            $timeout.cancel(timer);
            timer = $timeout(function() { timer = null; }, 300);
          }
          else callFn = true;

          if (callFn) {
            if (scope.$selected) {
              return scope.$apply(function() {
                if (scope.$active) scope.$active = false;
                scope.$selected = false;
              });
            }

            // support promises - promises that are rejected or return false
            // will prevent selection.
            $q.when(handler(scope, {$event: event})).then(function(select) {
              if (select !== false) ctrl.select(scope);
            });
          }
        });
      }
    }
  };
}])

.directive('listItemEdit', function() {
  return {
    restrict: 'EA',
    require: ['^listView', '^listItem'],
    link: function(scope, $element, attrs, ctrl) {
      var listViewCtrl = ctrl[0];
    }
  };
});

})(angular);
