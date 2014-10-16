angular-listview
================

#### Simple, flexible Angular list view -- select, add, edit, remove.

Do you have a list of stuff?

Do you need to add stuff to it? Remove stuff? Edit stuff?

Do you want ngRepeat + helper directives to CRUD your lists of stuff?

Well. Aren't you in luck.

`npm install angular-listview` OR `bower install angular-listview`

### Usage

Use [bower]() or [npm]() to download `angular-listview`. Then add a script tag
or just freakin' [browserify]() all the things!

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
    <button list-add="someFunction()">You can add things too!</button>
  </div>
  <list-item>
    <h3>This will be repeated over and over and over!</h3>
    <pre>{{ foo | json}}</pre>
    <button list-item-edit="remove" ng-show="$editMode">Remove this foo!</button>
  </list-item>
</list-view>
```

`angular-listview` doesn't come with any CSS because I'm not presumptious. But
it will add some sweet classes for you. It even uses `ngAnimate` so you can get
hella fancy.

Toggling edit mode will add a **list-view-edit** class to whichever element has
the `list-view` directive. Selecting a `list-item` will add a **selected** class
to its element (and, potentially, an **active** class -- see the bit about
selection below for more).

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
