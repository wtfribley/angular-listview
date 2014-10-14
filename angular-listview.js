(function(angular) {
  'use strict';

  /**
   * @typedef {Error} ListViewMinErr
   */
  var ListViewMinErr = angular.$$minErr('listview');

  angular.module('listview', [])

.factory('listViewParser', ['$parse', function($parse) {

  // jscs:disable maximumLineLength
  var LIST_REGEXP = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;
  var ITEM_REGEXP = /^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/;
  // jscs:enable

  return {
    parse: function(expression) {
      var match = expression.match(LIST_REGEXP);

      if (!match) {
        throw new ListViewMinErr('iexp',
          "Expected expression in form of '_item_ in _collection_ (track by " +
          "_id_)?' but got '{0}'.", expression);
      }

      var collectionIdentifier = match[2];
      var lhs = match[1];
      match = lhs.match(ITEM_REGEXP);

      if (!match) {
        throw new ListViewMinErr('iidexp', "'_item_' in '_item_ in " +
          "_collection_' should be an identifier or '(_key_, _value_)' " +
          "expression, but got '{0}'.", lhs);
      }

      return {
        collectionMapper: $parse(collectionIdentifier),
        keyIdentifier: match[2] || '$index'
      };
    }
  };
}])

.controller('ListViewCtrl', function() {

  this.selectMode = 'none';
  this.selectScopes = [];
  this.parserResult = null;

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

  /**
   * @ngdoc method
   * @name listView.ListViewCtrl#remove
   * @kind function
   *
   * @description
   * Return an event handler which will remove the list item (as determined by
   * the results of a parsed ng-repeat expression) from the given `scope`.
   *
   * The handler will emit a `listview.remove` event, passing the item and the
   * collection from which it was removed.
   *
   * @param {obj} scope The scope to containing the list item to remove.
   * @returns {function()} An event handler.
   */
  this.remove = function remove(scope) {
    var pr = this.parserResult;

    return function() {
      var collection = pr.collectionMapper(scope);
      var key = scope.$eval(pr.keyIdentifier);
      var item;

      if (Array.isArray(collection)) {
        item = collection.splice(key, 1)[0];
      }
      else {
        item = collection[key];
        delete collection[key];
      }

      scope.$emit('listview.remove', item, collection);
    };
  };
})

.directive('listView', ['listViewParser', function(parser) {

  var SELECT_MODES = {
    single: 'single',
    multi: 'multi',
    active: 'active',
    none: 'none'
  };

  return {
    restrict: 'EA',
    controller: 'ListViewCtrl',
    compile: function($element, attrs) {

      // iOS-style edit/add header (TODO this part).
      var $header = angular.element('<div class="listview-header">');
      $header.append('<button list-edit>Edit</button>');
      $header.append('<button list-add>Add</button>');

      console.log($element.find('list-item'));

      // let's support ng-repeat expressions without re-implementing ng-repeat.
      var $repeat = angular.element('<div ng-repeat="' + attrs.list + '">');
      $repeat.append($element.contents());

      $element.append($header);
      $element.append($repeat);

      return function(scope, $element, attrs, ctrl) {

        // the controller will arbitrate selection - it needs to know the mode.
        ctrl.selectMode = SELECT_MODES[attrs.selectMode] || 'none';

        // for things like removing items, the controller needs to have access
        // to the parsed result of the `attrs.list` expression.
        ctrl.parserResult = parser.parse(attrs.list);
      };
    }
  };
}])

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

        // the select function can return false to prevent selection.
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

.directive('listItemEdit', ['$parse', function($parse) {
  return {
    restrict: 'A',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {

      // a particular event may be specified to trigger the edit behavior.
      var editEvent = attrs.editOn || 'click';

      // a handler may be an in-scope function or "delete"/"remove".
      var handler = attrs.listItemEdit || angular.noop;

      if (handler == 'delete' || handler == 'remove') {
        handler = ctrl.remove(scope);
      }
      else if (typeof handler == 'string') {
        handler = $parse(handler);
      }

      $element.on(editEvent, function(event) {
        event.stopPropagation();
        scope.$apply(function() { handler(scope, {$event: event}); });
      });
    }
  };
}]);

})(angular);
