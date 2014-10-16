(function(angular) {
  'use strict';

  /**
   * @typedef {Error} ListViewMinErr
   */
  var listViewMinErr = angular.$$minErr('listview');

  angular.module('listview', ['ngAnimate'])

// this is pretty much straight from ngRepeat.
.factory('listViewParser', ['$parse', function($parse) {

  // jscs:disable maximumLineLength
  var LIST_REGEXP = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;
  var ITEM_REGEXP = /^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/;
  // jscs:enable

  return {
    parse: function(expression) {
      var match = expression.match(LIST_REGEXP);

      if (!match) {
        throw listViewMinErr('iexp',
          "Expected expression in form of '_item_ in _collection_ (track by " +
          "_id_)?' but got '{0}'.", expression);
      }

      var collectionIdentifier = match[2];
      var lhs = match[1];
      match = lhs.match(ITEM_REGEXP);

      if (!match) {
        throw listViewMinErr('iidexp', "'_item_' in '_item_ in " +
          "_collection_' should be an identifier or '(_key_, _value_)' " +
          "expression, but got '{0}'.", lhs);
      }

      return {
        collection: $parse(collectionIdentifier),
        key: $parse(match[2]),
        item: $parse(match[1])
      };
    }
  };
}])

.controller('ListViewCtrl',
['$animate', 'listViewParser', function($animate, listViewParser) {

  /**
   * @ngdoc property
   * @name listview.ListViewCtrl#$element
   *
   * @description
   * The root (i.e. list-view) element of the list.
   */
  this.$element = null;

  /**
   * @ngdoc property
   * @name listview.ListViewCtrl#expression
   *
   * @description
   * The list expression (i.e. ng-repeat expression) defined as the "list"
   * attribute of {@link listview.ListViewCtrl#$element}.
   */
  this.expression = '';

  /**
   * @ngdoc property
   * @name listview.ListViewCtrl#selectMode
   *
   * @description
   * A string describing how selection should work on this list.
   *
   * May be one of the following values:
   *   - **none** Do not allow selection.
   *   - **single** Only one list item may be selected at a time.
   *   - **active** Same as single, but many list items may be active.
   *   - **multi** Any number of list items may be selected at a time.
   */
  this.selectMode = 'none';

  var selectElements = [];
  var editMode = false;
  var parse;

  /**
   * @ngdoc method
   * @name listview.ListViewCtrl#registerSelectElement
   * @kind function
   *
   * @description
   * The listItem directive uses this to register its element for selection.
   *
   * @param {object} $element A jqLite-wrapped element to select/deselect.
   * @returns {function()} Call this function to deregister the element.
   */
  this.registerSelectElement = function registerSelectElement($element) {

    selectElements.push($element);

    return function() {
      var index = selectElements.indexOf($element);
      if (index > -1) selectElements.splice(index, 1);
    };
  };

  /**
   * @ngdoc method
   * @name listview.ListViewCtrl#select
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
    if (this.selectMode == 'none') return;
    if (!~selectElements.indexOf($element)) return;

    if (~['single', 'active'].indexOf(this.selectMode)) {
      for (var i = 0, len = selectElements.length; i < len; i++) {
        $animate.removeClass(selectElements[i], 'selected');
      }
    }

    $animate.addClass($element, 'selected');
    if (this.selectMode == 'active') $animate.addClass($element, 'active');
  };

  /**
   * @ngdoc method
   * @name listview.ListViewCtrl#deselect
   * @kind function
   *
   * @description
   * Deselects a given element by removing the "selected" (and potentially the
   * "active") class.
   *
   * @param {obj} $element The jqLite element to deselect.
   */
  this.deselect = function deselect($element) {
    $animate.removeClass($element, 'active');
    $animate.removeClass($element, 'selected');
  };

  /**
   * @ngdoc method
   * @name listview.ListViewCtrl#toggleEditMode
   * @kind function
   *
   * @description
   * Toggles the list into/out of edit mode by adding/removing the
   * "list-view-edit" class on ListViewCtrl#$element.
   */
  this.toggleEditMode = function toggleEditMode() {
    editMode = !editMode;

    $animate[(editMode)
      ? 'addClass'
      : 'removeClass'
    ](this.$element, 'list-view-edit');

    return editMode;
  };

  /**
   * @ngdoc method
   * @name listview.ListViewCtrl#add
   *
   * @description
   * Add a given item to a collection in the given scope. Uses the result of
   * parsing ListViewCtrl#expression to determine that collection. When the
   * collection is an object, a **key** is required.
   *
   * @param {*} item An item to add to the collection.
   * @param {string=} key Key to use when the collection is an object.
   * @param {object} scope The scope containing the collection.
   * @throws {ListViewMinErr} Collection is an object, but no key is given.
   */
  this.add = function add(item, key, scope) {
    if (!parse) parse = listViewParser.parse(this.expression);
    if (!scope) {
      scope = key;
      key = null;
    }

    var collection = parse.collection(scope);

    if (Array.isArray(collection)) collection.push(item);
    else if (key) collection[key] = item;
    else {
      throw listViewMinErr('nokey', "Argument 'key' is required when list " +
        'is an object');
    }
  };

  /**
   * @ngdoc method
   * @name listview.ListViewCtrl#remove
   *
   * @description
   * Add an item from a collection in the given scope. Uses the result of
   * parsing ListViewCtrl#expression to determine both the collection and the
   * item. This is meant to be used with a scope such as that created by using
   * an ng-repeat directive on the collection.
   *
   * Specifically, the given scope should contain an "item" property, while
   * inheriting the collection.
   *
   * @param {object} scope The scope containing the item and the collection.
   * @throws {ListViewMinErr} Collection is an object, but no key can be parsed.
   */
  this.remove = function remove(scope) {
    if (!parse) parse = listViewParser.parse(this.expression);

    var collection = parse.collection(scope);
    var key = parse.key(scope);
    var item = (key)
      ? collection[key]
      : parse.item(scope);

    if (Array.isArray(collection)) {
      collection.splice(collection.indexOf(item), 1);
    }
    else if (key) delete collection[key];
    else {
      throw listViewMinErr('nokey', 'The expression used to iterate over an ' +
      "object must specify (_key_, _value_), but got '{0}'", this.expression);
    }
  };
}])

/**
 * @ngdoc directive
 * @name listView
 * @restrict EA
 *
 * @description
 * Creates a simple list, capable of adding/removing/editing its items.
 *
 * Filtering and sorting are available by using ngRepeat internally. To that
 * end, the `list` attribute supports ngRepeat expressions.
 *
 * @param {string} list A valid ngRepeat expression used to iterate over a
 * collection of items.
 * @param {string} selectMode See {@link listview.ListViewCtrl#selectMode}
 */
.directive('listView', function() {

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
    scope: true,
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
        // to the `attrs.list` expression.
        ctrl.expression = attrs.list || '';

        // the controller needs a reference to the $element to do things like
        // toggling edit mode.
        ctrl.$element = $element;
      };
    }
  };
})

/**
 * @ngdoc directive
 * @name listEditToggle
 * @restrict EA
 *
 * @description
 * Toggles the list into/out of edit mode -- i.e. toggled the "list-view-edit"
 * class on {@link listview.ListViewCtrl#$element}.
 *
 * An expression may be given to `listEditToggle` which will be evaluated before
 * each toggle. It may return `false` to prevent the toggling. Expressions which
 * return promises are also supported. The expression will be provided with two
 * local variables:

 *  - **$event** The triggering event.
 *  - **$toEditMode** A boolean, `true` when transitioning *to* edit mode.
 *
 * @param {string} [listEditToggle] An expression.
 * @param {string} [toggleOn=click] Set the event which triggers a toggle.
 */
.directive('listEditToggle', ['$q', function($q) {
  return {
    restrict: 'EA',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {
      var handler = attrs.toggleIf || attrs.listEditToggle || true;
      var eventName = attrs.toggleOn || 'click';

      $element.on(eventName, function(event) {
        event.stopPropagation();

        var toEditMode = !ctrl.$element.hasClass('list-view-edit');

        $q.when(
          scope.$eval(handler, {$event: event, $toEditMode: toEditMode})
        ).then(function(toggle) {
          if (toggle === false) return;
          scope.$editMode = ctrl.toggleEditMode();
        });
      });
    }
  };
}])

/**
 * @ngdoc directive
 * @name listAdd
 * @restrict EA
 *
 * @description
 * Add a new item to the list.
 *
 * An expression must be given to `listAdd` which should return the new item.
 * The expression may also return a promise, resolving to the new item. When the
 * list's collection is an object, the expression should return an object with a
 * `$key` property - the value of which will become the new item's key in the
 * collection.

 * @param {string} listAdd An expression.
 * @param {string} [addOn=click] Set the event which calls the expression.
 */
.directive('listAdd', ['$q', function($q) {
  return {
    restrict: 'EA',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {
      var handler = attrs.add || attrs.listAdd;
      var eventName = attrs.addOn || 'click';

      // we can't do anything without a handler to return the new item.
      if (!handler) return;

      $element.on(eventName, function(event) {
        event.stopPropagation();

        $q.when(
          scope.$eval(handler, {$event: event})
        ).then(function(item) {
          if (!item) return;

          var key = item.$key;
          delete item.$key;

          ctrl.add(item, key, scope);
        });
      });
    }
  };
}])

/**
 * @ngdoc directive
 * @name listItem
 * @restrict EA
 *
 * @description
 * When creating a list, use `listItem` to define the item template which will
 * be repeated for each item. This directive also controls item selection by
 * toggling the "selected" (and, sometimes, the "active") class on its element.
 *
 * An expression may be given to `listItem` in the `selectIf` attribute. When
 * this expression evaluates to `false` (or returns a promise which is rejected
 * or resolves to `false), the selection will be canceled.
 *
 * @example
   <example>
    <list-view list="foo in collection" select-mode="single">
      <div>This could be the list's header</div>
      <list-item select-if="someFunction($event, foo)">
        {{ foo | json}}
      </list-item>
    </list-view>
   <example>
 *
 * @param {string} [selectIf] An expression.
 * @param {string} [selectOn=click] Set the event which calls the expression.
 */
.directive('listItem', ['$q', '$timeout', function($q, $timeout) {
  return {
    restrict: 'EA',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {
      var eventName = (ctrl.selectMode == 'none')
        ? null
        : attrs.selectOn || 'click';
      var handler = attrs.selectIf || true;
      var timer = null;

      // if we can't select items, there's nothing to do here.
      if (!eventName) return;

      // register the element -- returns a function to deregister the element
      // when the scope is destroyed.
      scope.$on('$destroy', ctrl.registerSelectElement($element));

      $element.on(eventName, function(event) {
        var callFunction = true;
        event.stopPropagation();

        // to provide compatibility with other directives, click events are
        // debounced so we only select once per double-click (we don't
        // completely separate click from dblclick, because there's no good way
        // to do so without causing a delay between click and selection).
        if (eventName == 'click') {
          callFunction = !timer;
          $timeout.cancel(timer);
          timer = $timeout(function() { timer = null; }, 300);
        }

        if (callFunction) {
          if ($element.hasClass('selected')) return ctrl.deselect($element);

          $q.when(scope.$eval(handler, {$event: event})).then(function(select) {
            if (select === false) return;
            ctrl.select($element);
          });
        }
      });
    }
  };
}])

/**
 * @ngdoc directive
 * @name listItemEdit
 * @restrict EA
 *
 * @description
 * Edit a list item. Give an expression to `listItemEdit` which will alter the
 * item. Use "remove" as a convenient shortcut to remove the item.
 *
 * @param {string} listItemEdit An expression OR "remove"
 * @param {string} [editOn=click] Set the event which calls the expression.
 */
.directive('listItemEdit', function() {
  return {
    restrict: 'EA',
    require: '^listView',
    link: function(scope, $element, attrs, ctrl) {
      var handler = attrs.edit || attrs.listItemEdit;
      var eventName = attrs.editOn || 'click';

      // we can't do anything without a handler.
      if (!handler) return;

      $element.on(eventName, function(event) {
        event.stopPropagation();

        scope.$apply(function() {
          if (handler == 'remove') return ctrl.remove(scope);
          scope.$eval(handler, {$event: event});
        });
      });
    }
  };
});

})(angular);
