document.addEventListener("WebComponentsReady", function() {
  runCustomTests();
});

function runCustomTests() {

  describe('px-breadcrumbs sets its display options', function () {
    var sandbox,
        breadcrumbsEl,
        breadcrumbsElWithData;

    beforeEach(function () {
      breadcrumbsEl = fixture('breadcrumbsFixture');
      breadcrumbsElWithData = fixture('breadcrumbsFixtureWithData');
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    // it('gives us back the full item path if the ulWidth is greater than the total size of all the full breadcrumbs', function() {
    //   breadcrumbsEl._ulWidth = 200;
    //   breadcrumbsEl.graph = {"something":"in here"};
    //   var itemPath = [{"item":true}];
    //   breadcrumbsEl._selectedItemPath = itemPath;

    //   var Breadcrumbs = function() {
    //     this.sizeOfFullBreadcrumbs = 100;
    //     return this; 
    //   };
    //   sandbox.stub(pxBreadcrumbs, 'Breadcrumbs').returns(Breadcrumbs);

    //   var mainPathItemsSetter = sandbox.stub(breadcrumbsEl, '_set_mainPathItems');

    //   breadcrumbsEl._rebuildBreadcrumbsDisplayOptions();

    //   expect(mainPathItemsSetter).to.have.been.calledOnce;
    //   expect(mainPathItemsSetter).to.have.been.calledWith(itemPath);

    // });
  });

  describe('px-breadcrumbs classes checks', function () {
    var sandbox,
        breadcrumbsEl,
        breadcrumbsElWithData;

    beforeEach(function () {
      breadcrumbsEl = fixture('breadcrumbsFixture');
      breadcrumbsElWithData = fixture('breadcrumbsFixtureWithData');
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('checks the captured click, and finds out if the click came from inside px-breadrumbs. This click does NOT come from inside px-breadcrumbs (_onCaptureClick)', function(done) {
      window.setTimeout(function() {
        var closeDropdown = sandbox.stub(breadcrumbsElWithData, '_closeDropdown'),
            firstLi = breadcrumbsElWithData.querySelector('.breadcrumbTopItem'),
            pTag = document.querySelector('.notElement');
        
        Polymer.dom.flush(); //make sure everything is ready
        firstLi.click(); //open the dropdown
        pTag.click(); //and click outside of it.

        expect(closeDropdown).to.have.been.calledOnce;
        done();
      },200);
    });


    it('calculates the correct class to see if the item is opened or not. This item doesn\'t have a source (_calculatePathItemClass)', function(done) {
      window.setTimeout(function() {
        var item = {"opened":true},
            response = '';

        breadcrumbsElWithData._clickPathItem = item,
        response = breadcrumbsElWithData._calculatePathItemClass(item)

        expect(response).to.equal('opened');
        done();
      },200);
    });

    it('calculates the correct class to see if the item is opened or not. This item does have a source (_calculatePathItemClass)', function(done) {
      window.setTimeout(function() {
        var item = {};
        
        item.source = {"opened":true};
        breadcrumbsElWithData._clickPathItem = item.source;

        var response = breadcrumbsElWithData._calculatePathItemClass(item)

        expect(response).to.equal('opened');
        done();
      },200);
    });

  it('calculates the correct class to see if the item is opened or not. This item is different than the pathItem (_calculatePathItemClass)', function(done) {
    window.setTimeout(function() {
      var item = {"opened":true},
          secondItem = {"opened": false},
          response = '';
      
      breadcrumbsEl._clickPathItem = item;

      response = breadcrumbsEl._calculatePathItemClass(secondItem)

      expect(response).to.equal('');
      done();
    },100);
  });

  it('checks to see if the passed in item is should return the highlighted class - this one should (_calculateDropdownItemClass)', function(done) {
    var item = {},
        response;
    item.highlighted = true;

    response = breadcrumbsEl._calculateDropdownItemClass(item);

    expect(response).to.equal('highlighted');
    done();
  });
  
  it('checks to see if the passed in item is should return the highlighted class - this one shoudn\'t (_calculateDropdownItemClass)', function(done) {
    var item = {},
        response;
    item.highlighted = false;

    response = breadcrumbsEl._calculateDropdownItemClass(item);

    expect(response).to.be.empty;
    done();
  });
});

describe('px-breadcrumbs creates the overflow array', function () {
    var sandbox,
        breadcrumbsEl,
        breadcrumbsElWithData,
        breadcrumbsObj,
        ulWidth;

    beforeEach(function () {
      breadcrumbsEl = fixture('breadcrumbsFixture');
      breadcrumbsElWithData = fixture('breadcrumbsFixtureWithData');
      sandbox = sinon.sandbox.create();
      breadcrumbsObj = {};
      breadcrumbsObj.sizeOfAllShortenedItemsExcludingLastItem = 600;
      breadcrumbsObj.sizeOfFullLastItem = 100;
      breadcrumbsObj.sizeOfEllipsis = 50;
      ulWidth = 300;

    });

    afterEach(function () {
      sandbox.restore();
    });

    it('has a first object with text of "..." (_createArrayWithOverflow)', function(done) {
      breadcrumbsObj.sizeOfIndividualShortItem = function() {
        return 100;
      }
      breadcrumbsObj.shortenedItems = [{"text":"hello"},{"text":"hello"},{"text":"hello"},{"text":"hello"},{"text":"hello"},{"text":"hello"},{"text":"hello"}];

      var strArray = [{"text":"hello"},{"text":"hello"},{"text":"hello"},{"text":"hello"},{"text":"hello"},{"text":"hello"},{"text":"hello"}]
      var response = breadcrumbsElWithData._createArrayWithOverflow(strArray, ulWidth, breadcrumbsObj);
      expect(response[0].text).to.equal("...");
      done();
    });

    it('returns an array of 3 items (_createArrayWithOverflow)', function(done) {
      breadcrumbsObj.sizeOfIndividualShortItem = function() {
        return 100;
      }
      breadcrumbsObj.shortenedItems = [{"text":"hello1"},{"text":"hello2"},{"text":"hello3"},{"text":"hello4"},{"text":"hello5"},{"text":"hello6"},{"text":"hello7"}];
      breadcrumbsObj.lastItemShort = "hell";
      breadcrumbsObj.lastItemFull ="Hello final one";
      var strArray = [{"text":"hello1"},{"text":"hello2"},{"text":"hello3"},{"text":"hello4"},{"text":"hello5"},{"text":"hello6"},{"text":"hello7"}]
      var response = breadcrumbsElWithData._createArrayWithOverflow(strArray, ulWidth, breadcrumbsObj);
      debugger;

      expect(response.length).to.equal(3);
      done();
    });
  });

describe('general methods', function() {

  var sandbox,
        breadcrumbsEl,
        breadcrumbsElWithData;

  beforeEach(function () {
    breadcrumbsEl = fixture('breadcrumbsFixture');
    breadcrumbsElWithData = fixture('breadcrumbsFixtureWithData');
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });
    
  it ('should return true if index is 1 (_isNotFirstItemInData)', function(done) {
    var response  = breadcrumbsEl._isNotFirstItemInData(1);
    expect(response).to.be.true;
    done();
  });

  it ('should return false if index is 0 (_isNotFirstItemInData)', function(done) {
    var response  = breadcrumbsEl._isNotFirstItemInData(0);
    expect(response).to.be.false;
    done();
  });

  it('checks if the properties _isDropdownHidden, _clickedItemChildren and _clickPathItem are called (_closeDropdown)', function(done) {
     var set = sandbox.stub(breadcrumbsEl, 'set');

     breadcrumbsEl._closeDropdown();

     expect(set).to.be.calledThrice;
     done();
  });

  it('checks if the properties _isDropdownHidden, _clickedItemChildren and _clickPathItem are called, as well as resetting the filter (_closeDropdown)', function(done) {
     var set = sandbox.stub(breadcrumbsEl, 'set'),
        resetFilter = sandbox.stub(breadcrumbsEl, '_resetFilter');
    
     breadcrumbsEl.filterMode = true;
     breadcrumbsEl._closeDropdown();

     expect(set).to.be.calledThrice;
     expect(resetFilter).to.be.calledOnce;
     done();
  });

  it('checks whether the filterString is reset when called', function(done) {
    var set = sandbox.stub(breadcrumbsEl, 'set');

    breadcrumbsEl._resetFilter();

    expect(set).to.be.calledOnce;
    done();
  });
});

describe('click Events', function() {

  var sandbox,
        breadcrumbsEl,
        breadcrumbsElWithData;

  beforeEach(function () {
    breadcrumbsEl = fixture('breadcrumbsFixture');
    breadcrumbsElWithData = fixture('breadcrumbsFixtureWithData');
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });
    
  it('should know if the clicked item is a iron-icon or not. this one IS an iron-icon (_normalizePathClickTarget)', function(done){
    var evt = {};

    evt.target = {};
    evt.target._iconsetName = 'fa';
    evt.target.parentNode = {};
    evt.target.parentNode.parentNode = "parentNode";
    var response = breadcrumbsEl._normalizePathClickTarget(evt);

    expect(response).to.equal('parentNode');
    done();
  });

  it('should know if the clicked item is a iron-icon or not. this one is NOT an iron-icon (_normalizePathClickTarget)', function(done){
    var evt = {};

    evt.target = {};
    evt.target._iconsetName = 'fat';
    evt.target.parentNode = {};
    evt.target.parentNode.parentNode = "parentNode";
    var response = breadcrumbsEl._normalizePathClickTarget(evt);

    expect(response).to.not.equal('parentNode');
    done();
  });

  it('checks whether the correct functions are called on a dropdown tap (_dropdownTap)', function(done) {
    var closeDropdown = sandbox.stub(breadcrumbsElWithData, '_closeDropdown'),
        changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        evt = {};
    
    evt.model = {};
    evt.model.item = {};
    breadcrumbsElWithData._dropdownTap(evt);

    expect(closeDropdown).to.be.calledOnce;
    expect(changePathFromClick).to.be.calledOnce;
    done();
  });

  it('checks whether when you change path from the click, the _selectedItem changes, and the px-breadcrumbs-item-changed is fired', function(done) {
    var set = sandbox.stub(breadcrumbsElWithData, 'set'),
        fire = sandbox.stub(breadcrumbsElWithData, 'fire'),
        item = {};
    
    breadcrumbsElWithData._changePathFromClick(item);

    expect(set).to.be.calledOnce;
    expect(fire).to.be.calledOnce;
    done();
  });

  it('checks whether the click in clickOnly mode, without overflow, calls closeDropdown and _changePathFromClick', function(done) {
    var closeDropdown = sandbox.stub(breadcrumbsElWithData, '_closeDropdown'),
        changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.text = "hello";

    breadcrumbsElWithData.clickOnlyMode = true;

    breadcrumbsElWithData._onPathTap(evt);

    expect(closeDropdown).to.be.calledOnce;
    expect(changePathFromClick).to.be.calledOnce;
    done();
  });

  it('checks whether the click in clickOnly mode, without overflow, with source calls closeDropdown and _changePathFromClick', function(done) {
    var closeDropdown = sandbox.stub(breadcrumbsElWithData, '_closeDropdown'),
        changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.source = {};
    evt.model.item.source.text = "hello";
    breadcrumbsElWithData.clickOnlyMode = true;

    breadcrumbsElWithData._onPathTap(evt);

    expect(closeDropdown).to.be.calledOnce;
    expect(changePathFromClick).to.be.calledOnce;
    done();
  });

  it('checks that if the same item that was previously clicked is clicked again, closeDropdown is called', function(done) {
    var closeDropdown = sandbox.stub(breadcrumbsEl, '_closeDropdown'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.text = "hello";

    breadcrumbsEl._clickPathItem = evt.model.item;

    breadcrumbsEl._onPathTap(evt);

    expect(closeDropdown).to.be.calledOnce;
    done();
  });

});

describe('does item have siblings', function() {

  var sandbox,
        breadcrumbsEl,
        breadcrumbsElWithData;

  beforeEach(function () {
    breadcrumbsEl = fixture('breadcrumbsFixture');
    breadcrumbsElWithData = fixture('breadcrumbsFixtureWithData');
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });
  
  it('checks whether the item passed is an overflow item (this one is), and if it has siblings (_doesItemHaveSiblings)', function(done) {
    var itemInPath = {},
        graph = {};

    itemInPath.text = "...";
    graph.hasSiblings = function() {
      return true;
    }
    breadcrumbsEl.graph = graph;

    var response = breadcrumbsEl._doesItemHaveSiblings(itemInPath);

    expect(response).to.be.false;
    done();
  });

  it('checks whether the item passed is an overflow item (this one is not), and if it has siblings (_doesItemHaveSiblings)', function(done) {
    var itemInPath = {},
        graph = {};

    itemInPath.text = "hello";
    graph.hasSiblings = function() {
      return true;
    }
    breadcrumbsEl.graph = graph;

    var response = breadcrumbsEl._doesItemHaveSiblings(itemInPath);

    expect(response).to.be.true;
    done();
  });

  it('checks whether the item source passed is an overflow item (this one is not), and if it has siblings (_doesItemHaveSiblings)', function(done) {
    var itemInPath = {},
        graph = {};
    
    itemInPath.source= {};
    itemInPath.source.text = "hello";
    graph.hasSiblings = function() {
      return true;
    }
    breadcrumbsEl.graph = graph;

    var response = breadcrumbsEl._doesItemHaveSiblings(itemInPath);

    expect(response).to.be.true;
    done();
  });

});
}