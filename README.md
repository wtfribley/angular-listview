angular-listview
================

#### Simple, flexible Angular list view: select, add, edit, remove.

##### Do you have a list of stuff?

##### Do you need to add stuff to it? Remove stuff? Edit stuff?

##### Do you want `ngRepeat` + helper directives to CRUD your lists?

Well. Aren't you in luck.

`npm install angular-listview` OR `bower install angular-listview`

### Usage

Use [bower](http://bower.io/) or [npm](https://www.npmjs.org/) to download
`angular-listview`. Then add a script tag or just freakin'
[browserify](http://browserify.org/) all the things!

Then add `listview` to your app's dependencies.

```js
var myApp = angular.module('myApp', ['listview'])
```

Now you're ready to make lists on lists.

```html
<list-view list="foo in collectionOfFoos" select-mode="single">
  <div>
    <h1>This could be a header, title, whatever!</h1>
    <button list-edit-toggle>You can toggle "$editMode"</button>
    <button list-add="addAFoo()">You can add things too!</button>
  </div>
  <list-item>
    <h3>This will be repeated over and over and over!</h3>
    <pre>{{ foo | json}}</pre>
    <button list-item-edit="remove" ng-show="$editMode">Remove this foo!</button>
  </list-item>
</list-view>
```

### Classes

`angular-listview` doesn't come with any CSS because I'm not presumptious like
that. But it will add some sweet classes for you. It even uses `ngAnimate` so
you can get hella fancy. Read the sections below to see what classes get added
and when.

### Selecting Stuff

`list-view` supports four (that's right, four!) select modes:

  - **none** prevents any selection at all.
  - **single** only one `list-item` may be selected at a time.
  - **active** just like single, but many `list-items` may be active at once.
  - **multi** any number of `list-items` may be selected at a time.

The default mode is **none** - but you can change that like so:

```html
<list-view list="foo in collection" select-mode="single">
```

By default, clicking on a `list-item` will select it - but you can change the
triggering event if you want:

```html
<list-view list="foo in collection" select-mode="single">
  <list-item select-on="dblclick">{{foo}}</list-item>
</list-view>
```

You can also give each `list-item` a select handler using the `select-if`
attribute. This is an expression which will be evaluated each time selection is
triggered. If its result is `false` - or a promise which is rejected or resolves
to `false` - the selection is prevented.

```html
<list-view list="foo in collection" select-mode="single">
  <list-item select-if="someFunction(foo)">{{foo}}</list-item>
</list-view>
```

#### Classes

When a `list-item` is selected, its element will have the **"selected"** class.
An active `list-item` will have the **"active"** class.

### Adding Stuff

Sometimes need to add stuff to a list - actually, a user needs to add stuff to
a list by clicking or tapping or key-downing... `list-add` makes that easy.

```html
<list-view list="foo in collection">

  <button list-add="'bar'">Add a bar!</button>
  <!-- or -->
  <list-add add="getSomeUserInput()" add-on="dblclick">Add a thing!</list-add>
  
  <list-item>{{foo}}</list-item>
</list-view>
```

`list-add` lets you give an expression which should evaluate to the new item to
be added to the list. It supports expressions which return promises, so you can
wait for user input!

Just like `list-item`, you can change the event that triggers the addition using
the `add-on` attribute.

### Edit Mode 

When doing destructive things with your lists, sometimes you want to make it a
two-step process. This is why `list-view` supports an "edit mode" - it lets you
make iOS-style lists: put the list into edit mode to reveal delete buttons, for
example.

Use the `list-edit-toggle` directive to control moving into/out of edit mode. It
works almost exactly like `list-item` - you can give it an expression, which
will prevent toggling if it evaluates to `false`.

```html
<list-view list="foo in collection">
  
  <button
    list-edit-toggle="shouldWeToggle($toEditMode)"
    toggle-on"dblclick">
    Edit
  </button>

  <!-- or -->
  <list-edit-toggle
    toggle-if="shouldWeToggle($toEditMode)">
    Edit
  </list-edit-toggle>

  <list-item>
    {{foo}}
    <div ng-show="$editMode">We're in edit mode now!</div>
  </list-item>
</list-view>
```

The expression may use the boolean local variable `$toEditMode` to determine if
you're toggling to or from edit mode.

#### Classes

When the list is in edit mode, the `$editMode` scope variable will be `true` and
the **"list-view-edit"** class will be added to the `list-view` element.

### Editing and Removing Items

To trigger an edit on list item, use the `list-item-edit` directive:

```html
<list-view list="foo in collection">
  <list-item>
    {{foo}}

    <button list-item-edit="editThis(foo)">edit me!</div>
    <!-- or -->
    <list-item-edit edit="editThis(foo)">edit me!</list-item-edit>

  </list-item>
</list-view>
```

Again, this works much like selection or addition - you define an expression
that will edit the item. Use the `edit-on` to change the event triggering the
edit (again, the default is a click).

`list-item-edit` also supports a shortcut to remove an item from the list:

```html
<list-view list="foo in collection">
  <list-item>
    {{foo}}

    <button list-item-edit="remove">remove me!</div>
    <!-- or -->
    <list-item-edit edit="remove">remove me!</list-item-edit>

  </list-item>
</list-view>
```

### Development

First, run `npm install` from the project directory to install dev dependencies.

This module uses [Gulp](http://gulpjs.com/) to build:

`$ gulp build`

[Karma](http://karma-runner.github.io/) - using
[Mocha](http://visionmedia.github.io/mocha/) and [Chai](http://chaijs.com/) - to
test:

`$ gulp test` or `$ npm test`

And to watch files - linting, testing and building on changes:

`$ gulp watch`

-----

&copy; 2014 Weston Fribley

This software is MIT licensed - please see `LICENCE` for details.
