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

    it('checks the captured click, and finds out if the click came from inside px-breadcrumbs. This click does NOT come from inside px-breadcrumbs (_onCaptureClick)', function(done) {
      window.setTimeout(function() {
        var closeDropdown = sandbox.stub(breadcrumbsElWithData, '_closeDropdown'),
            firstLi = breadcrumbsElWithData.querySelector('.breadcrumbTopItem'),
            pTag = document.querySelector('.notElement');
        debugger
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
      breadcrumbsObj._sizeOfIndividualShortItem = function() {
        return 100;
      };
      breadcrumbsObj.shortenedItems = [{"label":"hello"},{"label":"hello"},{"label":"hello"},{"label":"hello"},{"label":"hello"},{"label":"hello"},{"label":"hello"}];

      var strArray = [{"label":"hello"},{"label":"hello"},{"label":"hello"},{"label":"hello"},{"label":"hello"},{"label":"hello"},{"label":"hello"}]
      var response = breadcrumbsElWithData._createArrayWithOverflow(strArray, ulWidth, breadcrumbsObj);
      expect(response[0].label).to.equal("...");
      done();
    });

    it('returns an array of 3 items (_createArrayWithOverflow)', function(done) {
      breadcrumbsObj._sizeOfIndividualShortItem = function() {
        return 100;
      };
      breadcrumbsObj.shortenedItems = [{"label":"hello1"},{"label":"hello2"},{"label":"hello3"},{"label":"hello4"},{"label":"hello5"},{"label":"hello6"},{"label":"hello7"}];
      breadcrumbsObj.lastItemShort = "hell";
      breadcrumbsObj.lastItemFull ="Hello final one";
      var strArray = [{"label":"hello1"},{"label":"hello2"},{"label":"hello3"},{"label":"hello4"},{"label":"hello5"},{"label":"hello6"},{"label":"hello7"}]
      var response = breadcrumbsElWithData._createArrayWithOverflow(strArray, ulWidth, breadcrumbsObj);


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

  it('')
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

  it('checks whether the filtered Mode is returned correctly (_isFilterdMode)', function(done) {
    breadcrumbsEl.filterMode = true;

    var response = breadcrumbsEl._isFilteredMode();
    expect(response).to.be.true;
    done();
  });

  it('checks whether the filtered Mode is returned correctly (_isFilterdMode)', function(done) {
    breadcrumbsEl.filterMode = false;

    var response = breadcrumbsEl._isFilteredMode();
    expect(response).to.be.false;
    done();
  });

  // it('checks whether click only mode is on, and the passed item isn\'t an overflow (_isClickOnlyModeAndNotOverflow)', function(done) {
  //   breadcrumbsEl.clickOnlyMode = true;
  //   var item = {};

  //   item
  // });
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

  it('checks whether the click in clickOnly mode, without overflow, calls closeDropdown and _changePathFromClick', function(done) {
    var closeDropdown = sandbox.stub(breadcrumbsElWithData, '_closeDropdown'),
        changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.label = "hello";

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
    evt.model.item.source.label = "hello";
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
    evt.model.item.label = "hello";

    breadcrumbsEl._clickPathItem = evt.model.item;

    breadcrumbsEl._onPathTap(evt);

    expect(closeDropdown).to.be.calledOnce;
    done();
  });

  it('checks if the item has siblings/is overflow, and calls _clickedItemChildren, _clickPathItem, _isDropdownHidden, _changeDropdownPosition (_onPathTap)', function(done) {
    var changeDropdownPosition = sandbox.stub(breadcrumbsElWithData, '_changeDropdownPosition'),
        _doesItemHaveSiblings = sandbox.stub(breadcrumbsElWithData, '_doesItemHaveSiblings', () => true),
        set = sandbox.stub(breadcrumbsElWithData, 'set'),

        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.label = "hello";
    breadcrumbsElWithData._assetGraph = {};

    breadcrumbsElWithData._assetGraph.getSiblings = () => [{"label":"hello1"},{"label":"hello2"},{"label":"hello3"},{"label":"hello4"},{"label":"hello5"},{"label":"hello6"},{"label":"hello7"}];
    breadcrumbsElWithData._onPathTap(evt);

    expect(set).to.be.calledThrice;
    expect(changeDropdownPosition).to.be.calledOnce;
    done();
  });

  it('checks if the item has siblings/is overflow, and calls _clickedItemChildren, _clickPathItem, _isDropdownHidden, _changeDropdownPosition as well as resetFilter (_onPathTap)', function(done) {

    var changeDropdownPosition = sandbox.stub(breadcrumbsElWithData, '_changeDropdownPosition'),
        _doesItemHaveSiblings = sandbox.stub(breadcrumbsElWithData, '_doesItemHaveSiblings', () => true),
        set = sandbox.stub(breadcrumbsElWithData, 'set'),
        resetFilter = sandbox.stub(breadcrumbsElWithData, '_resetFilter'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.label = "hello";
    breadcrumbsElWithData._assetGraph = {};
    breadcrumbsElWithData.filterMode = true
    breadcrumbsElWithData._assetGraph.getSiblings = () => [{"label":"hello1"},{"label":"hello2"},{"label":"hello3"},{"label":"hello4"},{"label":"hello5"},{"label":"hello6"},{"label":"hello7"}];
    breadcrumbsElWithData._onPathTap(evt);

    expect(set).to.be.calledThrice;
    expect(changeDropdownPosition).to.be.calledOnce;
    expect(resetFilter).to.be.calledOnce;
    done();
  });

  it('checks if the item has siblings (it doesn\'t this time around), and calls _closeDropdown, _clickedItemChildren, _changePathFromClick, (_onPathTap)', function(done) {
    var changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        _doesItemHaveSiblings = sandbox.stub(breadcrumbsElWithData, '_doesItemHaveSiblings', () => false),
        set = sandbox.stub(breadcrumbsElWithData, 'set'),
        closeDropdown = sandbox.stub(breadcrumbsElWithData, '_closeDropdown'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.label = "hello";

    breadcrumbsElWithData._onPathTap(evt);

    expect(set).to.be.calledOnce;
    expect(changePathFromClick).to.be.calledOnce;
    expect(closeDropdown).to.be.calledOnce;
    done();
  });

  it('checks that an event is fired (_notifyClick)',function(done) {
    var item = {"label":"hello"},
        fire = sandbox.stub(breadcrumbsEl, 'fire');

    breadcrumbsEl._notifyClick(item);

    expect(fire).to.be.calledOnce;
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

  it('checks whether the item passed is an overflow item (this one is not), and if it has siblings (_doesItemHaveSiblings)', function(done) {
    var itemInPath = {},
        graph = {};

    itemInPath.label = "hello";
    graph.hasSiblings = function() {
      return true;
    }
    breadcrumbsEl._assetGraph = graph;

    var response = breadcrumbsEl._doesItemHaveSiblings(itemInPath);

    expect(response).to.be.true;
    done();
  });

});

describe('checks various positioning methods', function() {

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

  it('checks that the cssText is set on the dropdown (_changeDropdownPosition)', function(done) {
    var evt = {},
        dropdown = {},
        dom = {};

    dropdown.style = {};
    dropdown.style.cssText = '';
    dom.querySelector = () => dropdown;

    sandbox.stub(Polymer,'dom').returns(dom);

    evt.getBoundingClientRect = () => ({"left":10,"bottom":10,"height": 10});

    var normalizePathClickTarget = sandbox.stub(breadcrumbsElWithData, '_normalizePathClickTarget').returns(evt);

    breadcrumbsElWithData._changeDropdownPosition(evt);

    expect(dropdown.style.cssText).to.not.be.empty;
    done();
  });

  it('checks that the top and left are set correctly on the dropdown (_changeDropdownPosition)', function(done) {
    var evt = {},
        dropdown = {},
        dom = {};

    dropdown.style = {};
    dropdown.style.cssText = '';
    dom.querySelector = () => dropdown;

    sandbox.stub(Polymer,'dom').returns(dom);

    evt.getBoundingClientRect = () => ({"left":20,"bottom":10,"height": 10});

    var normalizePathClickTarget = sandbox.stub(breadcrumbsElWithData, '_normalizePathClickTarget').returns(evt);

    breadcrumbsElWithData._changeDropdownPosition(evt);

    var top = dropdown.style.cssText.substr(4,2),
        left = dropdown.style.cssText.substr(16,2);

    expect(top).to.eql('22');
    expect(left).to.eql('10');
    done();
  });
});


describe('Breadcrumb Class', function() {

  var sandbox,
      breadcrumbsEl,
      breadcrumbsElWithData,
      breadcrumbs,
      graph,
      nodes,
      breadcrumbsArray;

  beforeEach(function () {
    nodes = [
            {
            "label":"1 This is a very long string with more than 16 characters",
            "id":"id1",
            "children": [
              {"label":"2 This is a very long string with more than 16 characters",
                "id":"id2",
                "children": [
                  {"label": "3.a.i"},
                  {"label": "3.b.i"},
                  {"label": "3.c.i"},
                  {"label":"3 This is a very long string with more than 16 characters",
                    "id":"id3",
                    "children": [
                      {"label": "4.a.i"},
                      {"label": "4.b.i"},
                      {"label": "4.c.i"},
                      {"label":"4 This is a very long string with more than 16 characters",
                        "id":"id4",
                        "children": [
                          {"label":"5 This is a very long string with more than 16 characters",
                            "id":"id5",
                            "children": [
                              {"label": "6.a.i"},
                              {"label": "6.b.i"},
                              {"label": "6.c.i"},
                              {"label":"6 This is a very long string with more than 16 characters",
                                "id":"id6",
                                "children": [
                                  {"label": "7.a.i"},
                                  {"label": "7.b.i"},
                                  {"label": "7.c.i"},
                                  {"label":"7 This is a very long string with more than 16 characters",
                                   "id":"id7"}
                                ]},
                              {"label": "6.b"},
                              {"label": "6.c"}
                            ]},
                          {"label": "5.b"},
                          {"label": "5.c"}
                          ]
                        },
                      {"label": "4.d.i"},
                      {"label": "4.e.i"},
                      {"label": "4.f.i"},
                      {"label": "4.g.i"},
                      {"label": "4.i.i"},
                      {"label": "4.j.i"},
                      {"label": "4.k.i"},
                      {"label": "4.l.i"},
                      {"label": "4.m.i"},
                      {"label": "4.n.i"},
                      {"label": "4.o.i"}
                      ]
                    }
                  ]
                }
              ]
            },
            {"label": "1.a"}
          ];
    breadcrumbsArray = [nodes[0], nodes[0].children[0],nodes[0].children[0].children[3],nodes[0].children[0].children[3].children[3]];
    sandbox = sinon.sandbox.create();
    graph = new window.PxApp.assetGraph();
    graph.addChildren(null, nodes, {
      recursive: true,
      childrenKey: 'children'
    });

    breadcrumbs = new window.pxBreadcrumbs.Breadcrumbs(breadcrumbsArray, graph);

  });

  afterEach(function () {
    sandbox.restore();
  });

  it('checks it creates a new instance', function() {
    expect(breadcrumbs).to.be.instanceOf(window.pxBreadcrumbs.Breadcrumbs);
  });

  it('checks that the returned size of full breadcrumbs is as expected (sizeOfFullBreadcrumbs)', function() {
    var response = breadcrumbs.sizeOfFullBreadcrumbs;

    expect(response).to.be.closeTo(1569, 5);
  });

  it('checks that the returned size of full breadcrumbs is as expected (_calculateSizeOfBreadcrumbs)', function() {
    var response = breadcrumbs._calculateSizeOfBreadcrumbs(breadcrumbs.breadcrumbs);

    expect(response).to.be.closeTo(1569, 5);
  });

  it('checks that the returned size of full breadcrumbs except last one is as expected (sizeOfAllShortenedItemsExcludingLastItem)', function() {
    var response = breadcrumbs.sizeOfAllShortenedItemsExcludingLastItem;

    expect(response).to.be.closeTo(377, 5);
  });

  it('checks that the returned size of the last full item is as expected (sizeOfFullLastItem)', function() {
    var response = breadcrumbs.sizeOfFullLastItem;

    expect(response).to.be.closeTo(385, 5);
  });

  it('checks that the returned size of the last short item is as expected (sizeOfShortLastItem)', function() {
    var response = breadcrumbs.sizeOfShortLastItem;

    expect(response).to.be.closeTo(121, 5);
  });

  it('checks that the last full item is returned as expected (lastItemFull)', function() {
    var response = breadcrumbs.lastItemFull;

    expect(response.label).to.be.eql('4 This is a very long string with more than 16 characters');
  });

  it('checks that the last short item is returned as expected (lastItemShort)', function() {
    var response = breadcrumbs.lastItemShort;

    expect(response.label).to.be.eql('4 This...acters');
  });

  it('checks that the shortenedItem length is as expected (shortenedItems)', function() {
    var response = breadcrumbs.shortenedItems;

    expect(response).to.have.lengthOf(4);
  });

  it('checks that the shortenedItem items has the shortedned text as expected (shortenedItems)', function() {
    var response = breadcrumbs.shortenedItems;

    expect(response[0].label).to.be.eql('1 This...acters');
    expect(response[1].label).to.be.eql('2 This...acters');
    expect(response[2].label).to.be.eql('3 This...acters');
    expect(response[3].label).to.be.eql('4 This...acters');
  });

  it('checks that the size of the ellipsis is as expected (sizeOfEllipsis)', function() {
    var response = breadcrumbs.sizeOfEllipsis;

    expect(response).to.be.closeTo(9,3);
  });

  it('checks that the size of all the shortened items is as expected (sizeOfAllShortenedItems)', function() {
    var response = breadcrumbs.sizeOfAllShortenedItems;

    expect(response).to.be.closeTo(513,3);
  });

  it('checks that the length of the array of all the shortened items except the last one is as expected (allShortenedItemsExcludingLast)', function() {
    var response = breadcrumbs.allShortenedItemsExcludingLast;

    expect(response).to.have.lengthOf(3);
  });

  it('checks that the array returns the shortened items as expected (allShortenedItemsExcludingLast)', function() {
    var response = breadcrumbs.allShortenedItemsExcludingLast;

    expect(response[0].label).to.be.eql('1 This...acters');
    expect(response[1].label).to.be.eql('2 This...acters');
    expect(response[2].label).to.be.eql('3 This...acters');
  });

  it('checks that the _getShortenedText method is called as many times as the length of the items array that\'s passed into it', function() {
    var items = [nodes[0], nodes[0].children[0],nodes[0].children[0].children[3],nodes[0].children[0].children[3].children[3] ];
    var getShortenedText = sandbox.stub(breadcrumbs, '_getShortenedText');
    breadcrumbs._preShortenItems(items);


    expect(getShortenedText).to.have.callCount(items.length);
  });

  it('checks if the text is shortened as expected (_getShortenedText)', function() {
    var response = breadcrumbs._getShortenedText(nodes[0]);

    expect(response).to.be.eql('1 This...acters');
  });

  it('checks if the size of the full item is as expected (_sizeOfIndividualFullItem)', function() {
    var response = breadcrumbs._sizeOfIndividualFullItem(nodes[0]);

    expect(response).to.be.closeTo(349,5);
  });

  it('checks if the size of the short item is as expected (_sizeOfIndividualShortItem)', function() {
    var response = breadcrumbs._sizeOfIndividualShortItem(nodes[0]);

    expect(response).to.be.closeTo(85,5);
  });

  it('checks that the correct size is returned for all full strings (_calculateSizeOfBreadcrumbs)', function() {
    var response = breadcrumbs._calculateSizeOfBreadcrumbs(breadcrumbs.breadcrumbs);

    expect(response).to.be.closeTo(1569,5);
  });

  it('checks that the correct size is returned for all short strings (_calculateSizeOfBreadcrumbs)', function() {
    var response = breadcrumbs._calculateSizeOfBreadcrumbs(breadcrumbs.breadcrumbs, false);

    expect(response).to.be.closeTo(513,5);
  });

  it('checks if the returned object .measureText method exists (_createCanvas)', function() {
    var response = breadcrumbs._createCanvas();

    expect(response.measureText).to.exist;
  });
});

describe('integration tests, no special modes', function() {
  var sandbox,
      fixtureContainer,
      breadcrumbsEl;

  beforeEach(function () {
    fixtureContainer = fixture('breadcrumbsFixtureWithDataAndWidth');
    breadcrumbsEl = fixtureContainer.querySelector('px-breadcrumbs');
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('checks that if there\'s enough room, every item is displayed in full.', function(done) {
    fixtureContainer.style.width = '2820px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();
    window.setTimeout(function() {
      var items = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');
      expect(items).to.have.lengthOf(13);
      expect(items[0].innerText.trim()).to.eql('1 This is a very long string with more than 16 characters');
      expect(items[2].innerText.trim()).to.eql('2 This is a very long string with more than 16 characters');
      expect(items[4].innerText.trim()).to.eql('3 This is a very long string with more than 16 characters');
      expect(items[6].innerText.trim()).to.eql('4 This is a very long string with more than 16 characters');
      expect(items[8].innerText.trim()).to.eql('5 This is a very long string with more than 16 characters');
      expect(items[10].innerText.trim()).to.eql('6 This is a very long string with more than 16 characters');
      expect(items[12].innerText.trim()).to.eql('7 This is a very long string with more than 16 characters');
      done();
    },1000);
  });

  it('checks that if there\'s enough room, every item is shortened, except the last item, which is displayed in full.', function(done) {
    fixtureContainer.style.width = '2770px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();
    window.setTimeout(function() {
        var items = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');
        expect(items).to.have.lengthOf(13);
        expect(items[0].innerText.trim()).to.eql('1 This...acters');
        expect(items[2].innerText.trim()).to.eql('2 This...acters');
        expect(items[4].innerText.trim()).to.eql('3 This...acters');
        expect(items[6].innerText.trim()).to.eql('4 This...acters');
        expect(items[8].innerText.trim()).to.eql('5 This...acters');
        expect(items[10].innerText.trim()).to.eql('6 This...acters');
        expect(items[12].innerText.trim()).to.eql('7 This is a very long string with more than 16 characters');
        done();
    },100);
  });

  it('checks that if there\'s enough room, every item is shortened.', function(done) {
    fixtureContainer.style.width = '1150px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();
    window.setTimeout(function() {
      var items = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');
      expect(items).to.have.lengthOf(13);
      expect(items[0].innerText.trim()).to.eql('1 This...acters');
      expect(items[2].innerText.trim()).to.eql('2 This...acters');
      expect(items[4].innerText.trim()).to.eql('3 This...acters');
      expect(items[6].innerText.trim()).to.eql('4 This...acters');
      expect(items[8].innerText.trim()).to.eql('5 This...acters');
      expect(items[10].innerText.trim()).to.eql('6 This...acters');
      expect(items[12].innerText.trim()).to.eql('7 This...acters');
      done();
    },100);
  });

  it('checks that if there\'s enough room, overflow shows up with 2 shortened items, and a full last item.', function(done) {
    fixtureContainer.style.width = '900px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();
    window.setTimeout(function() {
      var items = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');
      expect(items).to.have.lengthOf(7);
      expect(items[0].innerText.trim()).to.eql('...');
      expect(items[2].innerText.trim()).to.eql('5 This...acters');
      expect(items[4].innerText.trim()).to.eql('6 This...acters');
      expect(items[6].innerText.trim()).to.eql('7 This is a very long string with more than 16 characters');
      done();
    },100);
  });

  it('checks that if there\'s enough room, overflow shows up with 1 shortened items, and a full last item', function(done) {
    fixtureContainer.style.width = '845px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();
    window.setTimeout(function() {
      var items = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');
      expect(items).to.have.lengthOf(5);
      expect(items[0].innerText.trim()).to.eql('...');
      expect(items[2].innerText.trim()).to.eql('6 This...acters');
      expect(items[4].innerText.trim()).to.eql('7 This is a very long string with more than 16 characters');
      done();
    },100);
  });

  it('checks that if there\'s enough room, overflow shows up with a full last item', function(done) {
    fixtureContainer.style.width = '766px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();
    window.setTimeout(function() {
      var items = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');
      expect(items).to.have.lengthOf(3);
      expect(items[0].innerText.trim()).to.eql('...');
      expect(items[2].innerText.trim()).to.eql('7 This is a very long string with more than 16 characters');
      done();
    },100);
  });

  it('checks that if there\'s enough room, overflow shows up with a short last item', function(done) {
    fixtureContainer.style.width = '640px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();
    window.setTimeout(function() {
      var items = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');
      expect(items).to.have.lengthOf(3);
      expect(items[0].innerText.trim()).to.eql('...');
      expect(items[2].innerText.trim()).to.eql('7 This...acters');
      done();
    },100);
  });

  it('checks that the dropdown is visible when the first top path item is clicked, and counts the number of items in the dropdown', function(done) {
    fixtureContainer.style.width = '2820px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();
    window.setTimeout(function() {
      var topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem'),
        dropdown = Polymer.dom(breadcrumbsEl.root).querySelector('.breadCrumbDropdown'),
        dropdownItems;

      expect(breadcrumbsEl._isDropdownHidden).to.be.true;
      topPathItems[0].click();
      Polymer.dom.flush();
      expect(breadcrumbsEl._isDropdownHidden).to.be.false;

      dropdownItems = Polymer.dom(dropdown).querySelectorAll('.dropdownItem');

      expect(dropdownItems).to.have.lengthOf(3); //it's 3, and not 2 because of the hidden results LI
      done();
    },100);
  });

  it('checks the the top path changes when an item with no siblings is clicked', function(done) {
    fixtureContainer.style.width = '2820px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();
    window.setTimeout(function() {
      var topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');

      expect(topPathItems).to.have.lengthOf(13);

      topPathItems[2].click();
      Polymer.dom.flush();
      topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');

      expect(topPathItems).to.have.lengthOf(3);
      done();
    },100);
  });

  it('checks that a dropdown item click changes the top Path items length', function(done) {
    fixtureContainer.style.width = '2820px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();

    window.setTimeout(function() {
      var topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem'),
          dropdownItems;

      expect(topPathItems).to.have.lengthOf(13);

      topPathItems[4].click();
      Polymer.dom.flush();

      dropdownItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.dropdownItem');

      dropdownItems[0].click();
      Polymer.dom.flush();

      topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');

      expect(topPathItems).to.have.lengthOf(5);
      done();
    },100);
  });

  it('checks that a dropdown item click from an overflow changes the top Path items length', function(done) {
    fixtureContainer.style.width = '640px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();

    window.setTimeout(function() {
      var topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem'),
          dropdownItems;

      expect(topPathItems).to.have.lengthOf(3);

      topPathItems[0].click();
      Polymer.dom.flush();

      dropdownItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.dropdownItem');

      dropdownItems[0].click();
      Polymer.dom.flush();

      topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');

      expect(topPathItems).to.have.lengthOf(1);
      done()
    },100);
  });
});

describe('integration tests, Click Only Mode', function(done) {
  var sandbox,
      fixtureContainer,
      breadcrumbsEl;

  beforeEach(function () {
    fixtureContainer = fixture('breadcrumbsFixtureWithDataAndWidthAndClickOnly');
    breadcrumbsEl = fixtureContainer.querySelector('px-breadcrumbs');
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('checks that the top Path Item length changes when an item is clicked', function(done) {
    fixtureContainer.style.width = '2820px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();

    window.setTimeout(function() {
      var topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');

      expect(topPathItems).to.have.lengthOf(13);

      topPathItems[0].click();
      Polymer.dom.flush();

      topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem');
      expect(topPathItems).to.have.lengthOf(1);
      done();
    },100);
  });
});

describe('integration tests, filter Mode', function(done) {
  var sandbox,
      fixtureContainer,
      breadcrumbsEl;

  beforeEach(function () {
    fixtureContainer = fixture('breadcrumbsFixtureWithDataAndWidthAndFilter');
    breadcrumbsEl = fixtureContainer.querySelector('px-breadcrumbs');
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('checks that the opened dropdown has the filter showing.', function(done) {
    fixtureContainer.style.width = '2820px';
    breadcrumbsEl.notifyResize();
    Polymer.dom.flush();

    window.setTimeout(function() {
      var filter = Polymer.dom(breadcrumbsEl.root).querySelector('.filter'),
          topPathItems = Polymer.dom(breadcrumbsEl.root).querySelectorAll('.breadcrumbTopItem'),
          breadcrumbDropdown = Polymer.dom(breadcrumbsEl.root).querySelector('.breadCrumbDropdown'),
          dropdown = Polymer.dom(breadcrumbsEl.root).querySelector('.breadCrumbDropdown');

      topPathItems[0].click();
      Polymer.dom.flush();
      expect(filter).to.exist;
      done();
    },100);
  });
});
}
