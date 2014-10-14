(function(angular) {
  'use strict';

  /**
   * @typedef {Error} ListViewMinErr
   */
  var ListViewMinErr = angular.$$minErr('listview');

  angular.module('listview', ['ngAnimate'])

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

.controller('ListViewCtrl', ['$animate', function($animate) {

  this.selectMode = 'none';
  this.selectElements = [];
  this.parserResult = null;

  this.$element = null;
  this.inEditMode = false;

  /**
   * @ngdoc method
   * @name listView.ListViewCtrl#select
   * @kind function
   *
   * @description
   * Select a given **element**, using the controller's **selectMode**.
   * A selected element will have the "selected" class, an active one the
   * "active" class.
   *
   *  - A selectMode of "none" prevents selection.
   *  - "single" or "active" allows only one element to be selected at a time.
   *  - "active" also allows many elements to be active.
   *  - "multi" allows many elements to be selected (no active elements).
   *
   * @param {obj} $element The jqLite element to select.
   */
  this.select = function select($element) {
    var selectMode = this.selectMode;

    if (selectMode == 'none') return;

    if (selectMode == 'single' || selectMode == 'active') {
      for (var i = 0, len = this.selectElements.length; i < len; i++) {
        $animate.removeClass(this.selectElements[i], 'selected');
      }
    }

    $animate.addClass($element, 'selected');
    if (selectMode == 'active') $animate.addClass($element, 'active');
  };

  /**
   * @ngdoc method
   * @name listView.ListViewCtrl#deselect
   * @kind function
   *
   * @description
   * Deselects a given element by removing the "selected" (and potentially the
   * "active") class.
   *
   * @param {obj} $element The jqLite element to deselect.
   */
  this.deselect = function deselect($element) {
    if ($element.hasClass('active')) $animate.removeClass($element, 'active');
    $animate.removeClass($element, 'selected');
  };

  /**
   * @ngdoc method
   * @name listView.ListViewCtrl#registerSelectElement
   * @kind function
   *
   * @description
   * The listItem directive registers its element to be selected.
   *
   * @param {object} $element A jqLite-wrapped element to select/deselect.
   * @returns {function()} Call this function to deregister the element.
   */
  this.registerSelectElement = function registerSelectElement($element) {
    var selectElements = this.selectElements;

    selectElements.push($element);
    return function() {
      selectElements.splice(selectElements.indexOf($element), 1);
    };
  };

  /**
   * @ngdoc method
   * @name listView.ListViewCtrl#toggleEditMode
   * @kind function
   *
   * @description
   * Toggles the list into/out of edit mode by calling all registered item edit
   * mode handlers, passing a boolean (true == edit mode).
   */
  this.toggleEditMode = function toggleEditMode() {
    this.editMode = !this.editMode;

    var method = (this.editMode)
      ? 'addClass'
      : 'removeClass';

    $animate[method](this.$element, 'edit-mode');
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
}])

.directive('listView', ['listViewParser', function(parser) {

  var SELECT_MODES = {
    single: 'single',
    multi: 'multi',
    active: 'active',
    none: 'none'
  };

  function isListItem(node) {
    return node.tagName && (
      node.hasAttribute('list-item') ||
      node.hasAttribute('data-list-item') ||
      node.tagName.toLowerCase() === 'list-item' ||
      node.tagName.toLowerCase() === 'data-list-item'
    );
  }

  return {
    restrict: 'EA',
    controller: 'ListViewCtrl',
    compile: function($element, attrs) {
      var $contents = $element.contents();
      var $item;

      for (var i = 0, len = $contents.length; i < len; i++) {
        if (isListItem($contents[i])) {
          $item = $contents.eq(i);
          break;
        }
      }

      // let's support ng-repeat expressions without re-implementing ng-repeat.
      $item.attr('ng-repeat', attrs.list);

      return function(scope, $element, attrs, ctrl) {

        // the controller will arbitrate selection - it needs to know the mode.
        ctrl.selectMode = SELECT_MODES[attrs.selectMode] || 'none';

        // for things like removing items, the controller needs to have access
        // to the parsed result of the `attrs.list` expression.
        ctrl.parserResult = parser.parse(attrs.list);

        // the controller needs a reference to the $element to do things like
        // enter/exit edit mode.
        ctrl.$element = $element;
      };
    }
  };
}])

.directive('listEdit', ['$parse', '$q', function($parse, $q) {
  return {
    restrict: 'A',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {

      // a particular event may be specified to trigger edit mode.
      var editEvent = attrs.editOn || 'click';

      // allow for custom handler function - return false / reject promise to
      // prevent transition into list edit mode.
      var handler = (!!attrs.listEdit)
        ? $parse(attrs.listEdit)
        : function() { return true; };

      $element.on(editEvent, function(event) {
        event.stopPropagation();

        if (ctrl.inEditMode) return ctrl.toggleEditMode();

        $q.when(handler(scope, {$event: event})).then(function(editMode) {
          if (editMode !== false) ctrl.toggleEditMode();
        });
      });
    }
  };
}])

.directive('listAdd', function() {
  return {
    restrict: 'A',
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

        // register the scope with the controller, allowing it to control
        // selection across the whole list.
        var deregisterElement = ctrl.registerSelectElement($element);
        scope.$on('$destroy', deregisterElement);

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
            if ($element.hasClass('selected')) return ctrl.deselect($element);

            // support promises - promises that are rejected or return false
            // will prevent selection.
            $q.when(handler(scope, {$event: event})).then(function(select) {
              if (select !== false) ctrl.select($element);
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
