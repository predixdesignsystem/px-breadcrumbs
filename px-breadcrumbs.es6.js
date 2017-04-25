(function() {
  Polymer({

    is: 'px-breadcrumbs', 

    properties: {
      /**
       * This array receives/holds the data that will be transformed into the breadcrumbs.
       */
      breadcrumbData: {
        type: Array,
        value: function() {return [];}
      },
      /**
       * This property holds the dynamically generated items (full or shortened, depending on the display options) that are used for the dom repeat,
       * which draws the main path items. It is read only and can ONLY be changed by the _rebuildBreadcrumbsDisplayOptions function to make sure it's not changed anywhere else.
       */
      _mainPathItems: {
        type: Array,
        value: function() {return [];},
        readOnly: true
      },
      /**
       * This property holds the latest clicked top path item.
       */
      _clickPathItem: {
        type: Object,
        value: function() {return {};}
      },
      /**
       * This property holds all the items that are to be shown in the dropdown - these are usually siblings, 
       * but can be children if the item is an overflow item.
       */
      _clickedItemChildren: {
        type: Array,
        value: function() {return [];},
      },
      /**
       * This Property is used to determine whether the dropdown is hidden or shown.
       */
      _isDropdownHidden: {
        type: Boolean,
        value: true
      },
      /**
       * This property holds the currently selectedItem. We start out with no value to avoid have it run through an empty object.
       */
      _selectedItem: {
        type: Object
      },
      /**
       * This property holds the size of the container, against which we make all of our calculations in 
       * breadcrumbs display options.
       * The value is auto generated either on page load, or on page resize.
       */
      _ulWidth: {
        type: Number,
        value: 0
      },
      /**
       * This property holds the path to the currently selected item.
       * This is generated dynamically by the graph whenever the _selectedItem prop changes.
       * It is readOnly to ensure that nothing but 1 process changes it.
       */
      _selectedItemPath: {
        type: Array,
        value: function() {return [];},
        readOnly: true
      }
    },
    behaviors: [Polymer.IronResizableBehavior],
    listeners: {
      'iron-resize': '_onResize'
    },
    observers: [
      '_calculatePath(_selectedItem)', 
      '_rebuildBreadcrumbsDisplayOptions(_selectedItemPath, _ulWidth)',
      'prepareData(breadcrumbData)'
      ],
      /**
       * This method checks whether the item that was passed in is the same one that is registered as the clicked one, and 
       * if so, returns the 'opened' class.
       * @param {Object} pathItem the item we are checking the class for
       */
    _calculatePathItemClass(pathItem) {
      pathItem = pathItem.source ? pathItem.source : pathItem;
      return (this._clickPathItem === pathItem) ? 'opened': '';
    },
    /**
     * This method is called automatically whenever the user changes the _selectedItem, or on initial page load, when we find the 
     * initial _selectedItem.
     * it ends up setting up the value of the readonly property _selectedItemPath from the graph.
     * @param {Object} selectedItem the item that was either clicked on, or passed in as a selectedItem from the beginning.
     */
    _calculatePath(selectedItem) {
      var graph = this.graph;
      this._set_selectedItemPath(graph.getPathToItem(selectedItem));
    },
    /**
     * This method is called by iron-resize. It hides/clears out the dropdown menu, and gets the container size to start the display options process.
     */
    _onResize() {
      this.set('_isDropdownHidden', true);
      this.set('_clickPathItem', {});
      this.set('_clickedItemChildren', []);
      this._getContainerSize();
    },
    /**
     * This method is called on initial page load, and on every page resize
     * to find the width of the container after a draw. we have an observer on _ulWidth that rebuilds the display options automatically.
     */
    _getContainerSize() {
      this.debounce('windowResize', () => {
        window.requestAnimationFrame(() => {
          var breadcrumbsContainer = Polymer.dom(this.root).querySelector('.container'),
              breadcrumbsUlContainer = Polymer.dom(breadcrumbsContainer).querySelector('ul'),
              bcUlContainerRect = breadcrumbsContainer.getBoundingClientRect();

          this.set('_ulWidth', bcUlContainerRect.width + 4); //the 4 is for the padding (2px on each side) on the ul.
        });
      },10);
      
    },
    /* 
    * in this method, we decide on the display options for the breadcrumbs. 
    * we have the following options:
    * 1. nothing needs to be shortened.
    * 2. we can shorten all but the last one
    * 2. we can shorten all including the last one
    * 3. we can shorten all of them, and include the overflow at the beginning of the array. the last one is NOT shortened by default, but can be shortened as needed.
    * @param {array} strArray an array of objects, which contains the breadcrumbs
    */
    _rebuildBreadcrumbsDisplayOptions() {

      var itemPath = this._selectedItemPath || [],
          graph = this.graph,
          _ulWidth = this._ulWidth;

      if (!itemPath.length || !graph || !_ulWidth) return;

      var breadcrumbsObj = new Breadcrumbs(itemPath, graph);

        /*
        * option 1 
        * we check to see if the container (which is sized automatically to fill out the page)
        * can fit all the items in the breadcrumbs.
        * the first option is the simpliest one - everything just fits, but if it doesn't fit...
        */
        if (_ulWidth > breadcrumbsObj.sizeOfFullBreadcrumbs) {
          //everything fits, no need to shorten anything
          this._set_mainPathItems(itemPath);
          return;
        }

        /*
        * option 2
        * we want to find out if the container can now fit all the 
        * shortened items + the last Item that wasn't shortened
        */
        if (_ulWidth > breadcrumbsObj.sizeOfAllShortenedItemsExcludingLastItem + breadcrumbsObj.sizeOfFullLastItem) {
          
          let strArrayShortenedWithFullLastItem = breadcrumbsObj.allShortenedItemsExcludingLast.concat(breadcrumbsObj.lastItemFull);
          this._set_mainPathItems(strArrayShortenedWithFullLastItem);
          return;
        }

        /*
        * option 3 
        * we check if we can fit after we've shortened all the items 
        */
        if (_ulWidth > breadcrumbsObj.sizeOfAllShortenedItems) {
          let strArrayShortened = breadcrumbsObj.shortenedItems;
          
          this._set_mainPathItems(strArrayShortened);
          return;
        }

        /*
        * option 4
        * we have to create an array with overflow.
        * we only get to this if non of the if statements above are true.
        */
      
        this._set_mainPathItems(this._createArrayWithOverflow(itemPath, _ulWidth, breadcrumbsObj));

    },
    /*
    * this method is called once we've established that we need to have an
    * array with overflow.
    * we keep removing the size of items - starting from the beginning of the array - 
    * from the total size of all the items, until we can fit everything + the last item that isn't shortened
    * into the container.
    * @param {Array} strArray the array that holds the breadcrumbs
    * @param {number} _ulWidth the width of the ul container
    */
    _createArrayWithOverflow(strArray, _ulWidth, breadcrumbsObj) {
      
      var pointer = 0,
          currentAccumSize = breadcrumbsObj.sizeOfAllShortenedItemsExcludingLastItem,
          sizeOfFullLastItem = breadcrumbsObj.sizeOfFullLastItem,
          sizeOfEllipsis = breadcrumbsObj.sizeOfEllipsis,
          noRoomForFullLastItem = false,
          lastItem = {},
          overflowObj = {"text": "...", "hasChildren": true},
          slicedStrArray = [];

      //keep looping until all the items fit into the container
      while (_ulWidth < sizeOfEllipsis + currentAccumSize + sizeOfFullLastItem) {
        //if we made it to the last item, and it's STILL can't fit, break out of the 
        // while loop, to ensure the last items doesn't go into the overflow object.
        if (pointer === strArray.length-1) {
          noRoomForFullLastItem = true;
          break
        }
        //get the size of the item we are placing into the overflow
        var removedSize = breadcrumbsObj.sizeOfIndividualShortItem(strArray[pointer]);
        // subtract the size from the overall accumulated size
        currentAccumSize -= removedSize;
        //and make sure to manually change our pointer.
        pointer++;
      }
      
      

      //create the overflow object, and populate its children with the shortened strings (if necessary)
      overflowObj.children = strArray.slice(0, pointer);

      //the last item is usually full size, but, if if it's just the overflow and the last item
      // and the last item is too long, it should shortened.
      lastItem  = (noRoomForFullLastItem) ? breadcrumbsObj.lastItemShort : breadcrumbsObj.lastItemFull;
      
      //add the overflow obj to the beginning of the array, and follow it up with all the shortened strings, 
      //starting with the point we stopped at with the pointer, and going till the last item, which is dynamically determined.
      slicedStrArray = [overflowObj].concat(breadcrumbsObj.shortenedItems.slice(pointer, strArray.length-1)).concat(lastItem);
      
      return slicedStrArray;

    },
    /**
     * This function is used to determine whether we are on the first Item in the array - used by a dom-if to check 
     * if we should display the right angle (yes on all but the first one)
     * @param {Number} index the index of the item
     */
    _isNotFirstItemInData(index) {
      return index !== 0;
    },

    /**
     * This method is used to determine where the path click came from - we have 3 different options, 
     * 1. the text
     * 2. the down chevron
     * 3. The side chevron
     * but we really want the encompossing LI, regardless of what was clicked. 
     * the two icons have a _iconsetName property that is 'fa' so we use that to determine if they were clicked, 
     * and if so, grab their parent, which is the LI.
     * @param {*} evt the event generated by the user tap
     */
    _normalizePathClickTarget(evt) {
      return (evt.target._iconsetName === 'fa') ? evt.target.parentNode.parentNode : evt.target;
    },
    /**
     *  
     * This method is called whenever breadcrumbsData is changed - which is either on load, 
     * or if the developer hands us an updated path. it is the ONLY thing that creates the graph 
     * and sets it on the component, as well as set the _selectedItem initially.
     * @param {Object} breadcrumbsData a JS Object that holds the breadcrumbs data.
     */
    prepareData(breadcrumbsData) {
        if (!breadcrumbsData.length) return;

        var graph = new Graph(this.breadcrumbData, this);
        
        this.set('graph', graph);
        this.set('_selectedItem', graph.selectedItem);
    },
    /**
     * This function checks whether the item in question has siblings.
     * if the item is an overflow item, we return a false, since it's not going to be in the graph anyway.
     * @param {*} itemInPath 
     */
    _doesItemHaveSiblings(itemInPath) {
      var graph = this.graph,
          source = itemInPath.source ? itemInPath.source : itemInPath,
          isItemOverflow = itemInPath.text === '...' ? true : false;

      return (!isItemOverflow)  ? graph.hasSiblings(source) : false;
    },
    /**
     * 
     * we consider a dropdown tap an event that changes the path. 
     * We make sure to pass the correct item into the graph by using the source property,
     * after we hide the dropdown and reset the last clicked item.
     * 
     * @param {Object} evt the click event from the dropdown item clicked
     */
    _dropdownTap(evt) {
      var newSelectItem = evt.model.item.source ? evt.model.item.source : evt.model.item;
      //this._setSelectedItem(newSelectItem);
      //this hides the dropdown
      this.set('_isDropdownHidden', true);
      this._changePathFromClick(newSelectItem);
      //and this clears out the field that hold the previously clicked path item.
      this.set('_clickPathItem', {});
      
    },
    /**
     * This method sets the _selectedItem to the item that was clicked - whether from the main path items, or the dropdown items
     * this is the only place we change _selectedItem on click.
     */
    _changePathFromClick(item) {
      this.set('_selectedItem', item);
      
    },
    /* on tap, we need to find out if the clicked item is the same as before.
    * if it is, we empty our the dropdown, hide it, and clear the _clickPathItem (the last item clicked).
    * if it is not the same item that was previously clicked, we save the new clicked item into _clickPathItem
    * set the siblings according to the item, show the dropdown and adjust the positioning for it.
    * sometimes, a top path item has no siblings, at which point we treat the click like a dropdown click - which is to say
    * we change the path accordingly.
    */
    _onPathTap(evt) {
      var dataItem = evt.model.item.source ? evt.model.item.source : evt.model.item;

      //if the item that is clicked is the open option, hide the dropdown, and reset the _clickPathItem object.
      if (this._clickPathItem === dataItem) {
        this.set('_isDropdownHidden', true);
        this.set('_clickedItemChildren', []);
        this.set('_clickPathItem', {});
        return;
      }

      // it's important to check if the clicked item is an overflow item, since it's the only one
      // that isn't in our graph - if we send it into getSiblings, the graph won't know what to do with it.
      // instead, if it IS an overflow item, we set the siblings as the children of dataItem.
      var isClickedItemOverflow = dataItem.text ==='...' ? true : false;

      if (this._doesItemHaveSiblings(dataItem) || isClickedItemOverflow) {
        var graph = this.graph,
            siblings = !isClickedItemOverflow ? graph.getSiblings(dataItem) : dataItem.children;
        
        this.set('_clickedItemChildren', siblings);
        this.set('_clickPathItem', dataItem);
        this._changeDropdownPosition(evt);
        this.set('_isDropdownHidden', false);
        
      // the clicked item has no siblings - we reset the contents of the dropdown
      // and change the path accordingly.
      } else {
        this.set('_clickedItemChildren', []);
        this._changePathFromClick(dataItem);
      }
    },
    /**
     * the dropdown is dynamically positioned - we find out the top and left of the clicked item,
     * and position the dropdown accordingly.
     * @param {Object} positioning an object which holds the new positioning for the dropdown
     */
    _changeDropdownPosition(evt) {
      var normalizedTarget = this._normalizePathClickTarget(evt),
          targetRect = normalizedTarget.getBoundingClientRect(),
          targetLeft = targetRect.left,
          targetBottom = targetRect.bottom,
          targetHeight = targetRect.height,
          windowScrollX = window.scrollX,
          windowScrollY = window.scrollY,
          dropdown = Polymer.dom(this.root).querySelector('.breadCrumbdropdown');
      
      dropdown.style.top = (targetBottom + windowScrollY) + 'px';
      dropdown.style.left = targetLeft + windowScrollX + 'px';
    },
    /**
     * This method dispatches a custom event ('px-breadcrumbs-item-clicked') that has the item attached to it.
     * the 'composed: true' property makes it so the event passes through shadow dom boundaries.
     * @param {*} item the item that was clicked on.
     */
    _notifyClick(item) {
      this.fire('px-breadcrumbs-item-clicked', {item: item, composed: true});
    },
    
  });
  
  class Breadcrumbs {
    constructor(breadcrumbs = [], graph) {
      this.graph = graph;
      this.breadcrumbs = breadcrumbs;
      this.map = new WeakMap();
      this.ctx = this._createCanvas();
      this._preShortenItems(this.breadcrumbs);
      return this;
    }
    
    /**
     * a getter that returns the size of the breadcrumb items - unshortened.
     * it checks to see if it has a value, and if so, returns the cached one, so we don't have to calculate the value again.
     */
    get sizeOfFullBreadcrumbs() {
      this.__sizeOfFullBreadcrumbs = this.__sizeOfFullBreadcrumbs || this._calculateSizeOfBreadcrumbs(this.breadcrumbs);
      return this.__sizeOfFullBreadcrumbs;
    }
    /**
     * a getter that returns the short size of the breadcrumb items excluding the last item. 
     */
    get sizeOfAllShortenedItemsExcludingLastItem() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs.slice(0, this.breadcrumbs.length-1), false);
    }
    /**
     * a getter that returns the size of the full last item
     */
    get sizeOfFullLastItem() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs.slice(-1));
    }
    /**
     * a getter that returns the size of the short last item
     */
    get sizeOfShortLastItem() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs.slice(-1), false);
    }
    /**
     * a getter that returns the last item in the breadcrumb array.
     */
    get lastItemFull() {
      return this.breadcrumbs.slice(-1)[0];
    }
    /**
     * a getter that returns the short version of the last item in the breadcrumbs array.
     */
    get lastItemShort() {
      return this.shortenedItems.slice(-1)[0];
    }
    /**
     * a getter that returns an array of all the shortened items in the breadcrumbs array 
     */
    get shortenedItems() {
      this.__shortenedItems = this.__shortenedItems ||  this.breadcrumbs.map((item) => {
        var wrapper = {};
        wrapper.source = item;
        wrapper.isTruncated = true;
        wrapper.text = this._getShortenedText(item);
        wrapper.children = item.children;
        wrapper.selectedItem = item.selectedItem;
        wrapper.hasChildren = item.hasChildren;
        return wrapper;
      });
      return this.__shortenedItems;
    }
    /**
     * a getter that returns the size - in pixels - of the overflow ellipsis
     */
    get sizeOfEllipsis() {
      return parseInt(this.ctx.measureText('...').width,10)
    }
    /**
     * a getter that returns the size - in pixels - of all the shortened breadcrumbs items
     */
    get sizeOfAllShortenedItems() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs, false);
    }
    /**
     * a getter that returns the size - in pixels - of all the shortened breadcrumbs items excluding the last item
     */
    get allShortenedItemsExcludingLast() {
      return this.shortenedItems.slice(0, this.shortenedItems.length -1);
    }
    /**
     * This method adds the item that is passed in to the weakMap if it is not already there.
     * @param {Object} item an item from the breadcrumbs array that is being added to the weakMap
     */
    _addToWeakMap(item) {
      const cachedItem = this.map.get(item) || null;
      if (!cachedItem) {
        this.map.set(item, item);  
      }
    }
    /**
     * This method is called when the class is instantiated. it loops through all the passed in items, and calls the _getShortenedText method on 
     * each item.
     * @param {Array} items an array of breadcrumbs items 
     */
    _preShortenItems(items) {
      for (let item of items) {
        this._getShortenedText(item);
      }
    }
    /**
     * This method returns the shortened version of the text in the item that is passed in, as well as add it into the map.
     * it checks for a cached version before it sets it.
     * @param {Object} item a breadcrumb Item
     */
    _getShortenedText(item) {
      const cachedItem = this.map.get(item) || {};
      cachedItem.shortText = cachedItem.shortText || `${item.text.substr(0,6)}...${item.text.substr(item.text.length-6)}`;
      this.map.set(item, cachedItem);
      return cachedItem.shortText;
    }
    /**
     * 
     * This method returns the size - in pixels - of the full size of the text in the passed in item, as well as add that info into the map.
     * it checks for a cached version before setting this value
     * @param {Object} item a breadcrumb Item
     */
    _sizeOfIndividualFullItem(item) {
      const cachedItem = this.map.get(item) || {};
      cachedItem.fullSize = (cachedItem.fullSize || parseInt(this.ctx.measureText(item.text).width,10));
      this.map.set(item, cachedItem);
      return cachedItem.fullSize;
    }
    /**
     * 
     * This method returns the size - in pixels - of the short size of the text in the passed in item, as well as add that info into the map.
     * it checks for a cached version before setting this value
     * @param {Object} item a breadcrumb Item
     */
    sizeOfIndividualShortItem(item) {
      const cachedItem = this.map.get(item) || {};
      cachedItem.shortSize = (cachedItem.shortSize || parseInt(this.ctx.measureText(cachedItem.shortText).width,10));
      this.map.set(item, cachedItem);
      return cachedItem.shortSize;
    }
    /**
     * 
     * This method loops through the passed in array, and gets the size - in pixels - of all the items
     * the size can be determined in either short or full text.
     * it takes into account the size of the iron icons, as well as padding on each item, and padding on the container.
     * 
     * @param {Array} strArray an array of the items we need the size calculated on.
     * @param {Boolean} useFullSize this determines whether the full size is measured, or the short size.
     */
    _calculateSizeOfBreadcrumbs(strArray, useFullSize=true) {
      if (strArray) {
        let accum = 0,
            i = 0,
            len = strArray.length,
            sizeOfItem;

        for (i=0; i<len;i++,sizeOfItem=null) {
          
          if (useFullSize) {
            sizeOfItem = this._sizeOfIndividualFullItem(strArray[i]);
          } else {
            sizeOfItem = this.sizeOfIndividualShortItem(strArray[i]);
          }
          var source = strArray[i].source ? strArray[i].source : strArray[i];
          accum += sizeOfItem + 15; //the 15 is for the right angle.
          //if the item has siblings, we need to add the size of the down chevron.
          if (strArray[i].text !== "..." && this.graph.hasSiblings(source)) {
            accum += 11;
          }
          //padding on each item (10 on each side)
          accum += 20;
        }
        //the 50 is for the padding left (20) + padding right (30)
        return accum + 50;
      }
    }
    /**
     * This method creates/returns the canvas that we will use to measure the size of the text.
     * we also set the font and font size.
     */
    _createCanvas() {
      const canvas = document.createElement('canvas');
      
      canvas.height = 20;
      canvas.width = 9999;

      const ctx = canvas.getContext('2d');
      ctx.font = "15px GE Inspira Sans";
      return ctx;
    }
  };
  
  class Graph {
    constructor(nodes) {
      this.map = new WeakMap();
      this._selectedItem = null;
      this.graph = this._crawlGraph(nodes);
      this.nodes = nodes;
      return this;
    }
    /**
     * This method is called when the class is instantiated. it loops through the nodes recursively, and add the metaData to each item
     * as well as adds the node into the weakMap.
     * 
     * @param {Array} nodes an array of breadcrumbs nodes
     */
    _crawlGraph(nodes) {
      var recursiveLoopThroughObj = function(nodes, parent, path=[]) {
          for (var i=0, len = nodes.length; i<len;i++) {
          var metaData = {},
            itemPath;

            if (parent) {
              metaData.parent = parent;
            }
            
            if (nodes.length >1) {
              metaData.siblings = nodes;
            }
                        
            itemPath = path.concat([nodes[i]]);
            
            if (nodes[i].children) {
              metaData.children = nodes[i].children;
              //if it has children, we want to keep digging in
              //and call ourselves with the children of the current item
              recursiveLoopThroughObj.call(this,nodes[i].children, nodes[i], itemPath);
            }

            metaData.path = itemPath;
            
            if (nodes[i].selectedItem) {
              this._selectedItem = nodes[i];

              //add the parent and the selected item itself to the path
              //metaData.path = path.concat(parent);
            }
            this.map.set(nodes[i], metaData);
          }

        }.bind(this);

        //the initial call into the recursion
        recursiveLoopThroughObj(nodes);
    }
    /**
     * This getter returns the selectedItem
     */
    get selectedItem() {
      return this._selectedItem;
    }
    /** 
     * this getter returns the selected Item's path.
     */
    get selectedItemPath() {
      var metaData = this.map.get(this._selectedItem);
      return (metaData) ? metaData.path : undefined;
    }
    /**
     * This method is called when a new item is selected - it 
     * changes the selected Item on the graph, and returns the new selected item path.
     * @param {Object} item the newly selected item
     */
    handleSelectedItem(item) {
      this.selectedItem = item;
      return this.selectedItemPath;
    }
    /**
     * This method returns the path specified on an item.
     * @param {Object} item 
     */
    getPathToItem(item) {
      var metaData = this.map.get(item);
      return metaData.path;
    }
    /**
     * This method returns whether or not the passed in item as any siblings.
     * @param {Object} item 
     */
    hasSiblings(item) {
      var siblings = this.map.get(item).siblings;
      return siblings && siblings.length >1;
    }
    /**
     * This method returns the passed in item's siblings.
     * @param {Object} item 
     */
    getSiblings(item) {
      var siblings = this.map.get(item).siblings;
      return siblings;
    }
    /**
     * This setter sets the selected Item on the Graph Map, as well as the selectedItem Property on the item itself.
     */
    set selectedItem(item) {
      if (item) {
        this._selectedItem.selectedItem = false;
        item.selectedItem = true;
        this._selectedItem = item;
      }
    }
  }
})();
