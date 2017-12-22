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

  it('checks whether the correct functions are called on a dropdown tap (_dropdownTap)', function(done) {
    var changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        evt = {};

    evt.model = {};
    evt.model.item = {};
    breadcrumbsElWithData._dropdownTap(evt);

    expect(changePathFromClick).to.be.calledOnce;
    done();
  });

  it('checks whether the click in clickOnly mode, without overflow, calls _changePathFromClick', function(done) {
    var changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.label = "hello";

    breadcrumbsElWithData.clickOnlyMode = true;

    breadcrumbsElWithData._onPathTap(evt);

    expect(changePathFromClick).to.be.calledOnce;
    done();
  });

  it('checks whether the click in clickOnly mode, without overflow, with source calls _changePathFromClick', function(done) {
    var changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.source = {};
    evt.model.item.source.label = "hello";
    breadcrumbsElWithData.clickOnlyMode = true;

    breadcrumbsElWithData._onPathTap(evt);

    expect(changePathFromClick).to.be.calledOnce;
    done();
  });

  it('checks if the item has siblings/is overflow, and calls _clickedItemChildren, _clickPathItem, _changeDropdownPosition (_onPathTap)', function(done) {
    var _doesItemHaveSiblings = sandbox.stub(breadcrumbsElWithData, '_doesItemHaveSiblings', () => true),
        set = sandbox.stub(breadcrumbsElWithData, 'set'),

        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.label = "hello";
    breadcrumbsElWithData._assetGraph = {};

    breadcrumbsElWithData._assetGraph.getSiblings = () => [{"label":"hello1"},{"label":"hello2"},{"label":"hello3"},{"label":"hello4"},{"label":"hello5"},{"label":"hello6"},{"label":"hello7"}];
    breadcrumbsElWithData._onPathTap(evt);

    expect(set).to.be.calledTwice;
    done();
  });

  it('checks if the item has siblings/is overflow, and calls _clickedItemChildren, _clickPathItem (_onPathTap)', function(done) {

    var _doesItemHaveSiblings = sandbox.stub(breadcrumbsElWithData, '_doesItemHaveSiblings', () => true),
        set = sandbox.stub(breadcrumbsElWithData, 'set'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.label = "hello";
    breadcrumbsElWithData._assetGraph = {};
    breadcrumbsElWithData._assetGraph.getSiblings = () => [{"label":"hello1"},{"label":"hello2"},{"label":"hello3"},{"label":"hello4"},{"label":"hello5"},{"label":"hello6"},{"label":"hello7"}];
    breadcrumbsElWithData._onPathTap(evt);

    expect(set).to.be.calledTwice;
    done();
  });

  it('checks if the item has siblings (it doesn\'t this time around), and calls _clickedItemChildren, _changePathFromClick (_onPathTap)', function(done) {
    var changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        _doesItemHaveSiblings = sandbox.stub(breadcrumbsElWithData, '_doesItemHaveSiblings', () => false),
        set = sandbox.stub(breadcrumbsElWithData, 'set'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.label = "hello";

    breadcrumbsElWithData._onPathTap(evt);

    expect(set).to.be.calledOnce;
    expect(changePathFromClick).to.be.calledOnce;
    done();
  });

  it('checks if the item is selectable and if not, does not call _changePathFromClick', function(done) {
    var changePathFromClick = sandbox.stub(breadcrumbsElWithData, '_changePathFromClick'),
        set = sandbox.stub(breadcrumbsElWithData, 'set'),
        evt = {};

    evt.model= {};
    evt.model.item = {}
    evt.model.item.isSelectable = false;

    breadcrumbsElWithData._onPathTap(evt);

    expect(set).to.not.be.calledOnce;
    expect(changePathFromClick).to.not.be.calledOnce;
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
    var fixtureContainer = fixture('breadcrumbsFixtureWithDataAndWidth');
    var defaultKeys = {
      "id" : "id",
      "label" : "label",
      "children" : "children"
    };
    breadcrumbsEl = fixtureContainer.querySelector('px-breadcrumbs');
    breadcrumbs = new window.pxBreadcrumbs.Breadcrumbs(breadcrumbsEl, graph, false, breadcrumbsArray, defaultKeys);

  });

  afterEach(function () {
    sandbox.restore();
  });

  it('checks it creates a new instance', function() {
    expect(breadcrumbs).to.be.instanceOf(window.pxBreadcrumbs.Breadcrumbs);
  });

  it('checks that the returned size of full breadcrumbs is as expected (sizeOfFullBreadcrumbs)', done => {
    expect(() => breadcrumbs.sizeOfFullBreadcrumbs)
      .to.eventuallyEqual(1594, {within: 9000, every: 200}, done);
  });

  it('checks that the returned size of full breadcrumbs is as expected (_calculateSizeOfBreadcrumbs)', done => {
    expect(() => breadcrumbs._calculateSizeOfBreadcrumbs(breadcrumbs.breadcrumbs))
      .to.eventuallyEqual(1594, {within: 9000, every: 200}, done);
  });

  it('checks that the returned size of full breadcrumbs except last one is as expected (sizeOfAllShortenedItemsExcludingLastItem)', done => {
    expect(() => breadcrumbs.sizeOfAllShortenedItemsExcludingLastItem)
      .to.eventuallyEqual(397, {within: 9000, every: 200}, done);
  });

  it('checks that the returned size of the last full item is as expected (sizeOfFullLastItem)', done => {
    expect(() => breadcrumbs.sizeOfFullLastItem)
      .to.eventuallyEqual(400, {within: 9000, every: 200}, done);
  });

  it('checks that the returned size of the last short item is as expected (sizeOfShortLastItem)', done => {
    expect(() => breadcrumbs.sizeOfShortLastItem)
      .to.eventuallyEqual(136, {within: 9000, every: 200}, done);
  });

  it('checks that the last full item is returned as expected (lastItemFull)', done => {
    expect(() => breadcrumbs.lastItemFull.label)
      .to.eventuallyEqual('4 This is a very long string with more than 16 characters', {within: 9000, every: 200}, done);
  });

  it('checks that the last short item is returned as expected (lastItemShort)', done => {
    expect(() => breadcrumbs.lastItemShort.label)
      .to.eventuallyEqual('4 This...acters', {within: 9000, every: 200}, done);
  });

  it('checks that the shortenedItem length is as expected (shortenedItems)', done => {
    expect(() => breadcrumbs.shortenedItems.length)
      .to.eventuallyEqual(4, {within: 9000, every: 200}, done);
  });

  it('checks that the shortenedItem items has the shortedned text as expected (shortenedItems)', done => {
    let response = breadcrumbs.shortenedItems;

    expect(() => breadcrumbs.shortenedItems[0].label)
      .to.eventuallyEqual('1 This...acters', {within: 9000, every: 200}, ()=>{
        expect(response[1].label).to.be.eql('2 This...acters');
        expect(response[2].label).to.be.eql('3 This...acters');
        expect(response[3].label).to.be.eql('4 This...acters');
        done();

      });

  });

  it('checks that the size of the ellipsis is as expected (sizeOfEllipsis)', done => {
    expect(() => breadcrumbs.sizeOfEllipsis)
      .to.eventuallyEqual(36, {within: 9000, every: 200}, done);
  });

  it('checks that the size of all the shortened items is as expected (sizeOfAllShortenedItems)', done => {
    expect(() => breadcrumbs.sizeOfAllShortenedItems)
    	.to.eventuallyEqual(538, {within: 9000, every: 200}, done);
  });

  it('checks that the length of the array of all the shortened items except the last one is as expected (allShortenedItemsExcludingLast)', done => {
    expect(() => breadcrumbs.allShortenedItemsExcludingLast.length)
      .to.eventuallyEqual(3, {within: 9000, every: 200}, done);
  });

  it('checks that the array returns the shortened items as expected (allShortenedItemsExcludingLast)', done => {
    let response = breadcrumbs.allShortenedItemsExcludingLast;
    expect(() => breadcrumbs.allShortenedItemsExcludingLast[0].label)
      .to.eventuallyEqual('1 This...acters', {within: 9000, every: 200}, () => {
        expect(response[1].label).to.be.eql('2 This...acters');
        expect(response[2].label).to.be.eql('3 This...acters');
        done();
      });
  });

  it('checks that the _getShortenedText method is called as many times as the length of the items array that\'s passed into it', done => {
    var items = [nodes[0], nodes[0].children[0],nodes[0].children[0].children[3],nodes[0].children[0].children[3].children[3] ];
    var getShortenedText = sandbox.stub(breadcrumbs, '_getShortenedText');
    breadcrumbs._preShortenItems(items);

    expect(() =>  getShortenedText.callCount)
      .to.eventuallyEqual(items.length, {within: 9000, every: 200}, done);
  });

  it('checks if the text is shortened as expected (_getShortenedText)', done => {
    expect(() => breadcrumbs._getShortenedText(nodes[0]))
      .to.eventuallyEqual('1 This...acters', {within: 9000, every: 1000}, done);
  });

  it('checks if the size of the full item is as expected (_sizeOfIndividualFullItem)', done => {
    expect(() => breadcrumbs._sizeOfIndividualFullItem(nodes[0]))
      .to.eventuallyEqual(349, {within: 9000, every: 1000}, done);
  });

  it('checks if the size of the short item is as expected (_sizeOfIndividualShortItem)', done => {
    expect(() => breadcrumbs._sizeOfIndividualShortItem(nodes[0]))
      .to.eventuallyEqual(85, {within: 9000, every: 200}, done);
  });

  it('checks that the correct size is returned for all full strings (_calculateSizeOfBreadcrumbs)', done => {
    expect(() => breadcrumbs._calculateSizeOfBreadcrumbs(breadcrumbs.breadcrumbs))
      .to.eventuallyEqual(1594, {within: 9000, every: 200}, done);
  });

  it('checks that the correct size is returned for all short strings (_calculateSizeOfBreadcrumbs)', done => {
    expect(() => breadcrumbs._calculateSizeOfBreadcrumbs(breadcrumbs.breadcrumbs, false))
      .to.eventuallyEqual(538, {within: 9000, every: 200}, done);
  });

  it('checks if the returned object .measureText method exists (_createCanvas)', done => {
    var response = breadcrumbs._createCanvas(breadcrumbsEl);
    expect(response.measureText).to.exist;
    done();
  });
});
