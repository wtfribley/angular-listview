describe('controller: ListViewCtrl', function() {
  var ctrl;
  var elements = [];
  var scope;

  beforeEach(module('listview'));

  beforeEach(inject(function(_$controller_, _$rootScope_) {
    ctrl = _$controller_('ListViewCtrl');
    elements = [];
    scope = _$rootScope_.$new();

    for (var i = 0; i < 3; i++) elements.push(angular.elements('<div>'));
  }));

  describe('Selection of Elements by Adding a "selected" Class', function() {

    it('should expose public method **ListViewCtrl#registerSelectElement**',
    function() {
      expect(ctrl.registerSelectElement).to.be.a('function');
    });

    it('should expose public method **ListViewCtrl#select**',
    function() {
      expect(ctrl.select).to.be.a('function');
    });

    it('should expose public method **ListViewCtrl#deselect**',
    function() {
      expect(ctrl.deselect).to.be.a('function');
    });

    it('should expose public string property **ListViewCtrl#selectMode** -- ' +,
    'defaults to "none"', function() {
      expect(ctrl.selectMode).to.equal('none');
    });

    describe('method: ListViewCtrl#select', function() {

      it('should select no elements when selectMode is "none"', function() {
        ctrl.selectMode = 'none';
        
        ctrl.registerSelectElement(elements[0]);
        ctrl.select(elements[0]);
        expect(elements[0].hasClass('selected')).to.be.false;
      });

      it('should select only one element at a time when selectMode is "single"',
      function() {
        ctrl.selectMode = 'single';
        
        ctrl.registerSelectElement(elements[0]);
        ctrl.registerSelectElement(elements[1]);

        ctrl.select(elements[0]);
        expect(elements[0].hasClass('selected')).to.be.true;
        expect(elements[1].hasClass('selected')).to.be.false;
        
        ctrl.select(elements[1]);
        expect(elements[0].hasClass('selected')).to.be.false;
        expect(elements[1].hasClass('selected')).to.be.true;
      });

      it('should select only one element at a time when selectMode is ' +
      '"active", but should allow multiple active elements', function() {
        ctrl.selectMode = 'active';

        ctrl.registerSelectElement(elements[0]);
        ctrl.registerSelectElement(elements[1]);

        ctrl.select(elements[0]);
        expect(elements[0].hasClass('selected')).to.be.true;
        expect(elements[0].hasClass('active')).to.be.true;
        expect(elements[1].hasClass('selected')).to.be.false;
        expect(elements[1].hasClass('active')).to.be.false;

        ctrl.select(elements[1]);
        expect(elements[0].hasClass('selected')).to.be.false;
        expect(elements[0].hasClass('active')).to.be.true;
        expect(elements[1].hasClass('selected')).to.be.true;
        expect(elements[1].hasClass('active')).to.be.true;

      });

      it('should allow multiple elements to be selected at a time when ' +
      'selectMode is "multi"', function() {
        ctrl.selectMode = 'multi';
        
        ctrl.registerSelectElement(elements[0]);
        ctrl.registerSelectElement(elements[1]);

        ctrl.select(elements[0]);
        expect(elements[0].hasClass('selected')).to.be.true;
        expect(elements[1].hasClass('selected')).to.be.false;
        
        ctrl.select(elements[1]);
        expect(elements[0].hasClass('selected')).to.be.true;
        expect(elements[1].hasClass('selected')).to.be.true;
      });
    });

    describe('method: ListViewCtrl#deselect', function() {
      it('should deselect a registered element', function() {
        ctrl.selectMode = 'single';
        
        ctrl.registerSelectElement(elements[0]);

        ctrl.select(elements[0]);
        expect(elements[0].hasClass('selected')).to.be.true;
        ctrl.deselect(elements[0]);
        expect(elements[0].hasClass('selected')).to.be.false;
      });
    });

    describe('method: registerSelectElement', function() {

      it('should only allow selection of registered elements', function() {
        ctrl.selectMode = 'single';

        expect(elements[0].hasClass('selected')).to.be.false;
        ctrl.select(elements[0]);
        expect(elements[0].hasClass('selected')).to.be.false;
        
        ctrl.registerSelectElement(elements[0]);
        expect(elements[0].hasClass('selected')).to.be.false;
        ctrl.select(elements[0]);
        expect(elements[0].hasClass('selected')).to.be.true;
    
      });

      it('should return a function that deregisters the element', function() {
        ctrl.selectMode = 'multi';

        var deregisterZero = ctrl.registerSelectElement(elements[0]);
        var deregisterOne = ctrl.registerSelectElement(elements[1]);
        var deregisterTwo = ctrl.registerSelectElement(elements[2]);
        
        deregisterOne();

        ctrl.select(elements[1]);
        expect(elements[0].hasClass('selected')).to.be.false;
        expect(elements[1].hasClass('selected')).to.be.false;
        expect(elements[2].hasClass('selected')).to.be.false;

        // a second call is a noop.
        deregisterOne();

        ctrl.select(elements[0]);
        ctrl.select(elements[1]);
        ctrl.select(elements[2]);
        expect(elements[0].hasClass('selected')).to.be.true;
        expect(elements[1].hasClass('selected')).to.be.false;
        expect(elements[2].hasClass('selected')).to.be.true;
      });
    });
  });

  describe('Toggling "Edit Mode" by Adding Class "list-view-edit"', function() {
    
    it('should expose public method **ListViewCtrl#toggleEditMode**',
    function() {
      expect(ctrl.toggleEditMode).to.be.a('function');
    });

    it('should expose public property **ListViewCtrl#$element**', function() {
      expect(ctrl.$element).to.equal(null);
    });

    describe('method: toggleEditMode', function() {
      
      it('should toggle the "list-view-edit" class on ListViewCtrl#$element',
      function() {
        ctrl.$element = elements[0];
        
        expect(ctrl.$element.hasClass('list-view-edit')).to.be.false;
        ctrl.toggleEditMode();
        expect(ctrl.$element.hasClass('list-view-edit')).to.be.true;
        ctrl.toggleEditMode();
        expect(ctrl.$element.hasClass('list-view-edit')).to.be.false;
      });
    });
  });

  describe('Adding/Removing Members of the List Collection', function() {
    
    it('should expose public method **ListViewCtrl#add**', function() {
      expect(ctrl.add).to.be.a('function');
    });

    it('should expose public method **ListViewCtrl#remove**', function() {
      expect(ctrl.remove).to.be.a('function');
    });

    it('should expose public property **ListViewCtrl#expression**',
    function() {
      expect(ctrl.parserResult).to.equal('');
    });

    describe('method: add', function() {

      it('should push an item onto an array in the given scope', function() {
        
        ctrl.expression = 'item in collection';
        scope.collection = ['a','b','c','d'];

        ctrl.add('e', scope);

        expect(scope.collection).to.have.length(5);
        expect(scope.collection[4]).to.equal('e');
      });

      it('should add an item to an object in the given scope', function() {
        
        ctrl.expression = 'item in collection';
        scope.collection = {a: 'A', b: 'B', c: 'C', d: 'D'};

        ctrl.add('E', 'e', scope);

        expect(scope.collection.e).to.equal('E');
      });

      it('should throw when collection is an object and no key is given',
      function() {
        
        ctrl.expression = 'item in collection';
        scope.collection = {a: 'A', b: 'B', c: 'C', d: 'D'};

        expect(ctrl.add.bind(ctrl, 'E', scope)).to.throw(/areq/);
      });
    });

    describe('method: remove', function() {

      it('should remove an item from an array in the given scope', function() {
        
        ctrl.expression = 'item in collection';
        scope.collection = [{name: 'a'},{name: 'b'},{name: 'c'},{name:'d'}];

        var itemScope = scope.$new();
        itemScope.item = scope.collection[2];

        ctrl.remove(itemScope);

        expect(scope.collection).to.have.length(3);
        scope.collection.forEach(function(item) {
          expect(item.name).to.not.equal('c');
        });
      });

      it('should remove an item from an object in the given scope', function() {
        
        ctrl.expression = '(key, val) in collection';
        scope.collection = {a: 'A', b: 'B', c: 'C', d: 'D'};

        var itemScope = scope.$new();
        itemScope.key = 'c';
        itemScope.val = scope.collection.c;

        ctrl.remove(itemScope);

        expect(scope.collection.c).to.not.exist;
      });

      it('should throw when collection is an object and no key can be parsed',
      function() {

        ctrl.expression = '(key, val) in collection';
        scope.collection = {a: 'A', b: 'B', c: 'C', d: 'D'};

        var itemScope = scope.$new();
        itemScope.val = scope.collection.c;

        expect(ctrl.remove.bind(ctrl, itemScope)).to.throw(/key/);
      });
    });
  });
});

// TODO: implement!
