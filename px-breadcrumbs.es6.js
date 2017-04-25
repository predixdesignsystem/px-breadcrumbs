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
      _mainPathItems: {
        type: Array,
        value: function() {return [];}
      },
      _clickPathItem: {
        type: Object,
        value: function() {return {};}
      },
      _clickedItemChildren: {
        type: Array,
        value: function() {return [];},
        
      },
      _isDropdownHidden: {
        type: Boolean,
        value: true
      },
      _selectedItem: {
        type: Object
      },
      _ulWidth: {
        type: Number,
        value: 0
      },
      _selectedItemPath: {
        type: Array,
        value: function() {return [];},
        readOnly: true
      }
    },
    behaviors: [Polymer.IronResizableBehavior],
    listeners: {
      'iron-resize': '_getContainerSize'
    },
    observers: [
      '_calculatePath(_selectedItem)', 
      '_rebuildBreadcrumbsDisplayOptions(_selectedItemPath, _ulWidth)',
      'prepareData(breadcrumbData)'
      ],
    _calculatePathItemClass(pathItem) {
      pathItem = pathItem.source ? pathItem.source : pathItem;

      return (this._clickPathItem === pathItem) ? 'opened': '';
    },
    _calculatePath(selectedItem) {
      var graph = this.graph;
      this._set_selectedItemPath(graph.getPathToItem(selectedItem));
    },
    /**
     * This method is called on initial page load, and on every page resize
     * to find the width of the container after a draw, and queues
     * the display options for the breadcrumbs for the next animation frame
     * 
     */
    _getContainerSize() {
      this.debounce('windowResize', () => {
        window.requestAnimationFrame(() => {
          var breadcrumbsContainer = Polymer.dom(this.root).querySelector('.container'),
              breadcrumbsUlContainer = Polymer.dom(breadcrumbsContainer).querySelector('ul'),
              bcUlContainerRect = breadcrumbsContainer.getBoundingClientRect();

          this.set('_ulWidth', bcUlContainerRect.width + 4); //the 4 is for the padding (2px on each side) on the ul.
        });

       // Polymer.RenderStatus.afterNextRender(this, this._rebuildBreadcrumbsDisplayOptions);
      },10);
      
    },
    /* 
    * in this method, we decide on the display options for the breadcrumbs. 
    * we have the following options:
    * 1. nothing needs to be shortened.
    * 2. we can shorten all but the last one
    * 2. we can shorten all including the last one
    * 3. we can shorten all of them, and include the overflow at the beginning of the array. the last one is NOT shortened.
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
          this.set('_mainPathItems', itemPath);
          return;
        }

        /*
        * option 2
        * we want to find out if the container can now fit all the 
        * shortened items + the last Item that wasn't shortened
        */
        if (_ulWidth > breadcrumbsObj.sizeOfAllShortenedItemsExcludingLastItem + breadcrumbsObj.sizeOfFullLastItem) {
          
          let strArrayShortenedWithFullLastItem = breadcrumbsObj.allShortenedItemsExcludingLast.concat(breadcrumbsObj.lastItemFull);
          this.set('_mainPathItems', strArrayShortenedWithFullLastItem);
          return;
        }

        /*
        * option 3 
        * we check if we can fit after we've shortened all the items 
        */
        if (_ulWidth > breadcrumbsObj.sizeOfAllShortenedItems) {
          let strArrayShortened = breadcrumbsObj.shortenedItems;
          
          this.set('_mainPathItems', strArrayShortened);
          return;
        }

        /*
        * option 4
        * we have to create an array with overflow.
        * we only get to this if non of the if statements above are true.
        */
      
        this.set('_mainPathItems',this._createArrayWithOverflow(itemPath, _ulWidth, breadcrumbsObj));

    },
    /*
    * this method is called once we've established that we need to have an
    * array with overflow.
    * we keep removing the size of items - starting from the beginning of the array - 
    *  from the total size of all the items, until we can fit everything + the last item that isn't shortened
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
     * 
     * 
     */
    prepareData(breadcrumbsData) {
        if (!breadcrumbsData.length) return;

        var graph = new Graph(this.breadcrumbData, this);
        
        this.set('graph', graph);
        this.set('_selectedItem', graph.selectedItem);
    },
    _addParentPropToItem(parent) {
      var i=0,
          children = parent.children,
          len = children.length,
          breadcrumbsObj = this.breadcrumbsObj;

      for (; i<len;i++) {
        var newItem = {};
        newItem.children = children[i].children;
        newItem.text = children[i].text;
        newItem.hasChildren = children[i].hasChildren;
        newItem.selectedItem = children[i].selectedItem;
        newItem.parent = parent;

        breadcrumbsObj._addToWeakMap = newItem;
      }
    },
    /**
     * This function checks whether the item in question has siblings.
     * @param {*} itemInPath 
     */
    _doesItemHaveSiblings(itemInPath) {
      
      var graph = this.graph,
          source = itemInPath.source ? itemInPath.source : itemInPath,
          isItemOverflow = itemInPath.text === '...' ? true : false;

      return (!isItemOverflow)  ? graph.hasSiblings(source) : false;
    },
    /**
     * this method calls a reset on whatever selected Item we 
     * previously had, and calls a set on the new selectedItem, as well as calls prepareData which determines 
     * how the breadcrumbs will show up.
     * @param {Object} evt the click event from the dropdown item clicked
     */
    _dropdownTap(evt) {
      var newSelectItem = evt.model.item.source ? evt.model.item.source : evt.model.item;
      //this._setSelectedItem(newSelectItem);
      //this hides the dropdown
      this.set('_isDropdownHidden', true);
      this._changePathFromClick(newSelectItem);
      //and this clears out the field that hold the previously clicked
      //path item.
      this.set('_clickPathItem', {});
      
    },
    /**
     * This method calls the prepareData method, which runs through the 
     */
    _changePathFromClick(item) {
      this.set('_selectedItem', item);
      
    },
    /* on tap, we need to find out if the clicked item is the same as before.
    * if it is, we make the dropdown go way.
    * if it is not, we save the new clicked item.
    */
    _onPathTap(evt) {
      var dataItem = evt.model.item.source ? evt.model.item.source : evt.model.item;

      //if the item that is clicked is the open option, hide the dropdown, and reset the _clickPathItem object.
      if (this._clickPathItem === dataItem) {
        this.set('_isDropdownHidden', true);
        this.set('_clickPathItem', {});
        return;
      }

      var isClickedItemOverflow = dataItem.text ==='...' ? true : false;

      if (this._doesItemHaveSiblings(dataItem) || isClickedItemOverflow) {
        var graph = this.graph,
            siblings = !isClickedItemOverflow ? graph.getSiblings(dataItem) : dataItem.children;
        
        this.set('_clickedItemChildren', siblings);
        this.set('_clickPathItem', dataItem);
        this.set('_isDropdownHidden', false);
        this._changeDropdownPosition(evt);

      } else {
        this.set('_clickedItemChildren', []);
        this._changePathFromClick(dataItem);
      }
    },
    /**
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
    
    get sizeOfFullBreadcrumbs() {
      this.__sizeOfFullBreadcrumbs = this.__sizeOfFullBreadcrumbs || this._calculateSizeOfBreadcrumbs(this.breadcrumbs);
      return this.__sizeOfFullBreadcrumbs;
    }
    get sizeOfAllShortenedItemsExcludingLastItem() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs.slice(0, this.breadcrumbs.length-1), false);
    }
    get sizeOfFullLastItem() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs.slice(-1));
    }
    get sizeOfShortLastItem() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs.slice(-1), false);
    }
    get lastItemFull() {
      return this.breadcrumbs.slice(-1)[0];
    }
    get lastItemShort() {
      return this.shortenedItems.slice(-1)[0];
    }
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
    get sizeOfEllipsis() {
      return parseInt(this.ctx.measureText('...').width,10)
    }
    get sizeOfAllShortenedItems() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs, false);
    }
    get allShortenedItemsExcludingLast() {
      return this.shortenedItems.slice(0, this.shortenedItems.length -1);
    }
    get sizeOfAllShortenedItems() {
      return this._calculateSizeOfBreadcrumbs(this.breadcrumbs, false);
    }

    _addToWeakMap(item) {
      const cachedItem = this.map.get(item) || null;
      if (!cachedItem) {
        this.map.set(item, item);  
      }
    }
    _preShortenItems(items) {
      for (let item of items) {
        this._getShortenedText(item);
      }
    }
    _getShortenedText(item) {
      const cachedItem = this.map.get(item) || {};
      cachedItem.shortText = cachedItem.shortText || `${item.text.substr(0,6)}...${item.text.substr(item.text.length-6)}`;
      this.map.set(item, cachedItem);
      return cachedItem.shortText;
    }
    _sizeOfIndividualFullItem(item) {
      const cachedItem = this.map.get(item) || {};
      cachedItem.fullSize = (cachedItem.fullSize || parseInt(this.ctx.measureText(item.text).width,10));
      this.map.set(item, cachedItem);
      return cachedItem.fullSize;
    }
    sizeOfIndividualShortItem(item) {
      const cachedItem = this.map.get(item) || {};
      cachedItem.shortSize = (cachedItem.shortSize || parseInt(this.ctx.measureText(cachedItem.shortText).width,10));
      this.map.set(item, cachedItem);
      return cachedItem.shortSize;
    }
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
          //padding on each item
          accum += 20;
        }
        //the 50 is for the padding left (20) + padding right (30)
        return accum + 50;
      }
    }
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
              //if it has children, we want to keep digging in
              //so we push the item we are on into the pathArray
              //and call ourselves with the children of the current item
              metaData.children = nodes[i].children;
              

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
    get selectedItem() {
      return this._selectedItem;
    }
    get selectedItemPath() {
      
      var metaData = this.map.get(this._selectedItem);
      return (metaData) ? metaData.path : undefined;
    }
    handleSelectedItem(item) {
      this.selectedItem = item;
      return this.selectedItemPath;
    }
    getPathToItem(item) {
      var metaData = this.map.get(item);
      return metaData.path;
    }
    hasSiblings(item) {
      var siblings = this.map.get(item).siblings;
      return siblings && siblings.length >1;
    }
    getSiblings(item) {
      var siblings = this.map.get(item).siblings;
      return siblings;
    }
    set selectedItem(item) {
      if (item) {
        this._selectedItem.selectedItem = false;
      item.selectedItem = true;
      this._selectedItem = item;
      }
    }
  }
})();
