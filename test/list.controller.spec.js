describe('controller: ListViewCtrl', function() {
  var ctrl;
  var elements = [];

  beforeEach(module('listview'));

  beforeEach(inject(function(_$controller_) {
    ctrl = _$controller_('ListViewCtrl');
    elements = [];

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

    it('should expose public property **ListViewCtrl#parserResult**',
    function() {
      expect(ctrl.parserResult).to.equal(null);
    });

    //TODO: need parserResult + scope... OR rethink add/remove.
  });
});
