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
      ulWidth: {
        type: Number,
        value: 0
      }
    },
    behaviors: [Polymer.IronResizableBehavior],
    listeners: {'iron-resize': '_getContainerSize'},
    observers: ['prepareData(_selectedItem)'],
    /**
     * This method has a chain of promises that process the data as needed.
     * first, we find the selected item inside _calculatePath
     * secondly, we set the _mainPathItems
     * thirdly, we figure out the display options - whether we need overflow, shorten any names, etc.
     * lastly, we set the _mainPathItems again, this time with the shortened/overflow version, 
     * if necessary
     */
    prepareData() {
      this._calculatePath()
      .then((pathArray) => {
        return this._breadcrumbsDisplayOptions(pathArray)})
      .then((pathArray) => {
        //and the second time this is being set, it's with the shortened versions, if necessary. 
        this.set('_mainPathItems', pathArray);
      });
    },
    /**
     * This method is called on initial page load, and on every page resize
     * to find the width of the container after a draw, and queues
     * the display options for the breadcrumbs for the next animation frame
     * 
     */
    _getContainerSize() {
      window.requestAnimationFrame(() => {
        var breadcrumbs = document.querySelector('px-breadcrumbs'),
            breadcrumbsContainer = Polymer.dom(breadcrumbs.root).querySelector('.container'),
            breadcrumbsUlContainer = Polymer.dom(breadcrumbsContainer).querySelector('ul'),
            bcUlContainerRect = breadcrumbsContainer.getBoundingClientRect();

        this.set('ulWidth', bcUlContainerRect.width + 4); //the 4 is for the padding (2px on each side) on the ul.
      });

      Polymer.RenderStatus.afterNextRender(this, () =>{
        this.prepareData();
      });
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
    _breadcrumbsDisplayOptions(strArray) {
      return new Promise((accept, reject) => {
        var breadcrumbsObj = new Breadcrumbs(strArray),
            ulWidth = this.ulWidth;
        /*
        * option 1 
        * we check to see if the container (which is sized automatically to fill out the page)
        * can fit all the items in the breadcrumbs.
        * the first option is the simpliest one - everything just fits, but if it doesn't fit...
        */
        if (ulWidth > breadcrumbsObj.sizeOfFullBreadcrumbs) {
          //everything fits, no need to shorten anything
          console.log('everything fits off the bat');
          return accept(strArray);
        }

        /*
        * option 2
        * we want to find out if the container can now fit all of the 
        * shortened items + the last Item  that wasn't shortened
        */
        if (ulWidth > breadcrumbsObj.sizeOfAllShortenedItemsExcludingLastItem + breadcrumbsObj.sizeOfFullLastItem) {
          console.log('shorten everything but the last one.');
          var strArrayShortenedWithFullLastItem = breadcrumbsObj.allShortenedItemsExcludingLast.concat(breadcrumbsObj.lastItemFull);
          return accept(strArrayShortenedWithFullLastItem);
        }

        /*
        * option 3 
        * we check if we can fit after we've shortened all the items 
        */
        if (ulWidth > breadcrumbsObj.sizeOfAllShortenedItems) {
          console.log('shorten everything fits');
          var strArrayShortened = breadcrumbsObj.shortenedItems;
          
          return accept(strArrayShortened);
        }

        /*
        * option 4
        * we have to create an array with overflow.
        * we only get to this if non of the if statements above are true.
        */
        
        return accept(this._createArrayWithOverflow(strArray, ulWidth));
      });
    },
    /*
    * this method is called once we've established that we need to have an
    * array with overflow.
    * we keep removing the size of items - starting from the beginning of the array - 
    *  from the total size of all the items, until we can fit everything + the last item that isn't shortened
    * into the container.
    * @param {Array} strArray the array that holds the breadcrumbs
    * @param {number} ulWidth the width of the ul container
    */
    _createArrayWithOverflow(strArray, ulWidth) {
      return new Promise((accept, reject) => {
      var shortenAllItemsWithOverflow = 99999,
          pointer = 0,
          removedItem,
          breadcrumbsObj = new Breadcrumbs(strArray),
          currentAccumSize = breadcrumbsObj.sizeOfAllShortenedItemsExcludingLastItem,
          sizeOfFullLastItem = breadcrumbsObj.sizeOfFullLastItem,
          sizeOfEllipsis = breadcrumbsObj.sizeOfEllipsis,
          removedAccumSize = 0,
          noRoomForFullLastItem = false,
          lastItem = {},
          overflowObj = {"text": "..."},
          slicedStrArray = [];
      //keep looping until all the items fit into the container
      while (ulWidth < sizeOfEllipsis + currentAccumSize + sizeOfFullLastItem) {
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
      overflowObj.children = breadcrumbsObj.shortenedItems.slice(0, pointer);

      //the last item is usually full size, but, if if it's just the overflow and the last item
      // and the last item is too long, it should shortened.
      lastItem  = (noRoomForFullLastItem) ? breadcrumbsObj.lastItemShort : breadcrumbsObj.lastItemFull;
      
      //add the overflow obj to the beginning of the array, and follow it up with all the shortened strings, 
      //starting with the point we stopped at with the pointer, and going till the last item, which is dynamically determined.
      slicedStrArray = [overflowObj].concat(breadcrumbsObj.shortenedItems.slice(pointer, strArray.length-1)).concat(lastItem);
      

      console.log('shorten everything, include overflow');
      return accept(slicedStrArray);
      });
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
     * This method resets the existing _selectedItem
     */
    _resetSelectedItem() {
      this.set('_selectedItem', false);
    },
    /**
     * This method is called on load, to calculate the initial Path, 
     * everytime a breadcrumb is clicked.
     * it recursively builds the path, and returns it as a promise.
     */
    _calculatePath() {
      return new Promise((accept, reject) => {
        var pathArray = [],
        currentDataObj = this.breadcrumbData,
        self = this,
        foundSelectedItem = false;
        var recursiveLoopThroughObj = function(pathItem) {
          for (var i=0, len = pathItem.length; i<len;i++) {
            if (foundSelectedItem) {
              break;
            };

            if (pathItem[i].selectedItem) {
                pathArray.push(pathItem[i]);
                foundSelectedItem = true;
                break;
              }

            if (pathItem[i].children) {
              //if it has children, we want to keep digging in
              //so we push the item we are on into the pathArray
              //and call ourselves with the children of the current item
              pathArray.push(pathItem[i]);
              recursiveLoopThroughObj(pathItem[i].children)
            }
          }
        };

        //the initial call into the recursion
        recursiveLoopThroughObj(currentDataObj);

        //once all the recursion is done, we can return the pathArray
        return accept(pathArray);
      });
    },
   
    /**
     * This function checks whether the item in question has children.
     * @param {*} itemInPath 
     */
    _doesItemHaveChildren(itemInPath) {
      return (itemInPath && itemInPath.hasChildren);
    },
    /**
     * This function is used to determine whether we are on the last Item in the array. - if 
     * the index is the last item in the aray (length -1), we return false.
     * @param {Number} index the index of the item
     */
    _isLastItemInData(index) {
      return this._mainPathItems[this._mainPathItems.length-1] === this._mainPathItems[index];
    },
    /**
     * This function is used to determine the correct classes that need to be passed in - if 
     * the index is the last item in the aray, we want it to be bold, so we pass the selected class.
     * 
     * @param {Number} index This represents the index of the item we are looking at in the array.
     */
    _calculatePathclass(index) {
      return this._isLastItemInData(index) ? ' selected' : '';
    },
    /**
     * this method calls a reset on whatever selected Item we 
     * previously had, and calls a set on the new selectedItem, as well as calls prepareData which determines 
     * how the breadcrumbs will show up.
     * @param {Object} evt the click event from the dropdown item clicked
     */
    _dropdownTap(evt) {
      this._resetSelectedItem();
      var newSelectItem = evt.model.item;
      this._setSelectedItem(newSelectItem);
      //this hides the dropdown
      this.set('_isDropdownHidden', true);
      this._changePathFromDropdownClick();
      //and this clears out the field that hold the previously clicked
      //path item.
      this.set('_clickPathItem', {});
      
    },
    /**
     * This method calls the prepareData method, which runs through the 
     */
    _changePathFromDropdownClick() {
      this.prepareData();
    },
    /**
     * This method sets a _selectedItem from the passed object.
     * @param {Object} selectedItem the new selected item
     */
    _setSelectedItem(selectedItem) {
      selectedItem.selectedItem = true;
      this.set('_selectedItem', selectedItem);
    },
    /* on tap, we need to find out if the clicked item is the same as before.
    * if it is, we make the dropdown go way.
    * if it is not, we save the new clicked item.
    */
    _onPathTap(evt) {
      var dataItem = evt.model.item;

      // if the selected item (the one at the end of the breadcrumb) has been clicked, ignore it.
      if (evt.model.item.selectedItem) {
        evt.stopPropagation();
        return;
      }
      //if the item that is clicked is the open option, hide the dropdown, and reset the _clickPathItem object.
      if (this._clickPathItem === dataItem) {
        this.set('_isDropdownHidden', true);
        this.set('_clickPathItem', {});
      } else {
        //new click on new item, set the clicked item, show the dropdown and set its position.
        this.set('_clickPathItem', dataItem);
        this.set('_isDropdownHidden', false);
        this._changeDropdownPosition(evt);
      }
      if (this._doesItemHaveChildren(dataItem)) {
        //dataItem.children = shortenedVersion(dataItem.children)
        this.set('_clickedItemChildren', dataItem.children);
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
      
      dropdown.style.top = (targetBottom + windowScrollY + 4) + 'px';
      dropdown.style.left = targetLeft + windowScrollX + 'px';
    },
    /**
     * This method dispatches a custom event ('px-breadcrumbs-item-clicked') that has the item attached to it.
     * the 'composed: true' property makes it so the event passes through shadow dom boundaries.
     * @param {*} item the item that was clicked on.
     */
    _notifyClick(item) {
      this.dispatchEvent(new CustomEvent('px-breadcrumbs-item-clicked', {item: item, composed: true}));
    }
  });
  
  class Breadcrumbs {
    constructor(breadcrumbs) {
      this.breadcrumbs = breadcrumbs;
      this.map = new WeakMap();
      this.ctx = this._createCanvas();
      this._preShortenItems(this.breadcrumbs);
      return this;
    }
    _preShortenItems(items) {
      for (let item of items) {
        this._getShortenedText(item);
      }
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
        var newItem = {};
        newItem.text = this._getShortenedText(item);
        newItem.children = item.children;
        newItem.selectedItem = item.selectedItem;
        newItem.hasChildren = item.hasChildren;
        return newItem;
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

          accum += sizeOfItem + 15; //the 15 is for the right angle.
          
          //if the item has children, we need to add the size of the down chevron.
          if (strArray[i].children) {
            accum += 11;
          }
        }
        return accum;
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
  }
  

})();
