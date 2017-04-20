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
        type: Object,
        value: function() {return {};}
      }
    },
    // attached() {
    //   this.prepareData();
    // },
    created() {
      this.async(() => {
        this._createCanvas();
      });
    },
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
    _calculateSizeOfBreadcrumbs(strArray, map, useFullSize=true) {
      if (strArray) {
        var ctx = this.ctx;

        for (var i=0; i<strArray.length;i++) {
          var item = map.get(strArray[i]) || {};
          var thingToMeasure = useFullSize ? strArray[i].text : item.shortText;
          //console.log(parseInt(ctx.measureText(strArray[i].text).width,10));
          var sizeOfItem = parseInt(ctx.measureText(thingToMeasure).width,10);

          //if the item has children, we need to the size of the down chevron.
          if (strArray[i].children) {
            sizeOfItem += 11;
          }

          item[useFullSize ? 'fullSize' : 'shortSize'] = sizeOfItem;
          map.set(strArray[i], item); 
        }
      }        
        
      return map;
    },

    _calculateAcummSize(items, map, requiredParam) {
        return items.reduce((accum, item, index) => {
          if (index !== items.length -1) {
            accum += 15;
          }
          return accum + map.get(item)[requiredParam];
        },0);
    },
    /* 
    * in this method, we decide on the display options for the breadcrumbs. 
    * we have the following options:
    * 1. we can shorten all but the last one, and see if they fit
    * 2. we can shorten all including the last one and see if they fit
    * 3. we can shorten all of them, and include the overflow at the beginning of the array.
    * @param {array} strArray an array of objects, which contains the breadcrumbs
    */
    _breadcrumbsDisplayOptions(strArray) {
      return new Promise((accept, reject) => {
        var ctx = this.ctx,
            map = new WeakMap(),
            accumulativeSizeOfAllBreadcrumbs;

        map = this._calculateSizeOfBreadcrumbs(strArray, map, true);
        
        accumulativeSizeOfAllBreadcrumbs = this._calculateAcummSize(strArray, map, 'fullSize');

         
          this.async(() => {
            var breadcrumbs = document.querySelector('px-breadcrumbs'),
                breadcrumbsContainer = Polymer.dom(breadcrumbs.root).querySelector('.container'),
                breadcrumbsUlContainer = Polymer.dom(breadcrumbsContainer).querySelector('ul'),
                bcUlContainerRect = breadcrumbsContainer.getBoundingClientRect(),
                ulWidth = bcUlContainerRect.width + 4; //the 4 is for the padding on the ul.

               
            // we check to see if the container (which is sized automatically to fill out the page)
            // can fit all the items in the breadcrumbs.
            //the first option is the simpliest one - everything just fits, but if it doesn't fit...
            if (ulWidth < accumulativeSizeOfAllBreadcrumbs) {
              var allButTheLastItem = strArray.slice(0, strArray.length-1);
              
              map = this._shortenLongAssetNames(strArray, map);
              map = this._calculateSizeOfBreadcrumbs(strArray, map, false);
              
              var sizeOfAllButLastItem = this._calculateAcummSize(, map, 'shortSize');
              var sizeOfLastItem = map.get(strArray[strArray.length-1]).fullSize;

              // var beginningItems = strArray.slice(0, strArray.length-1);
              // var lastItem = strArray.slice(-1);
              // var preparePromise = () => {
              //   var shortenedAllButTheLastItems, sizeOfAllButLastItem, sizeOfLastItem;
              //   this._shortenLongAssetNames(allButTheLastItem)
              //     .then((result) => {
              //       shortenedAllButTheLastItems = result;
              //       return this._calculateSizeOfBreadcrumbs(shortenedAllButTheLastItems);
              //     })
              //     .then((size) => {
              //       sizeOfAllButLastItem = size;
              //       return this._calculateSizeOfBreadcrumbs(lastItem);
              //     })
              //     .then((size) => {
              //       sizeOfLastItem = size;
              //       return Promise.resolve({sizeOfLastItem, sizeOfAllButLastItem, shortenedAllButTheLastItems});
              //     });
              // }

              //preparePromise.then(({sizeOfLastItem, sizeOfAllButLastItem, shortenedAllButTheLastItems}) => {
                //we want to find out if the container can now fit all of the shortened items + the last Item + 26 (11 for bottom chevron, 15 for side angle) for the last item, that wasn't shortened
              if (ulWidth < sizeOfAllButLastItem + sizeOfLastItem) {
                //it doesn't fit, so, we go to second option.
              
                var sizeOfAllShortenedItem = this._calculateAcummSize(strArray, map, 'shortSize');
                
                //we check if we can fit after we've shortened all the items
                if (ulWidth < sizeOfAllShortenedItem) {
                  //looks like we can't fit them, even after shortening them all. 
                  //time for option 3.
                  //i'm setting a random high number to start with
                  var shortenAllItemsWithOverflow = 99999,
                      pointer = 0,
                      removedItem,
                      currentAccumSize = sizeOfAllButLastItem + sizeOfLastItem,
                      removedAccumSize = 0;
                  //keep looping until all the items fit into the container
                  while (ulWidth < currentAccumSize) {

                    var removedSize = map.get(strArray[pointer]).shortSize;
                    currentAccumSize -= removedSize;
                    pointer++;
                    // removedAccumSize += 
                    // //we remove the first item - mutating allButTheLastItem, and returning the item
                    // //which then gets pushed into overflowArray, giving us an array of the items we
                    // //had to cut out once this loop is done.
                    // removedItem = allButTheLastItem.shift();
                    // //console.log(removedItem);
                    // overflowArray.push(removedItem);
                    // console.log(overflowArray);
                    // shortenAllItemsWithOverflow = this._calculateSizeOfBreadcrumbs(allButTheLastItem);
                    // currentAccumSize = currentAccumSize - this.
                  }
                  var overflowObj = {
                    "text": "...",
                    "children": this._getSmallStrs(strArray.slice(0, pointer))
                  },
                  slicedStrArray = [overflowObj].concat(this._getSmallStrs(strArray.slice(pointer)));
                  
                  //TODO 



















                  console.log('shorten everything, include overflow');
                  return accept(allButTheLastItem);
                } else {
                  console.log('shorten everything fits');
                  //we can fit all the breadcrumbs once we've shortened them.
                  return accept(shortenAllItems);
              }
              } else {
              //shortening everything but the last one works, so we 
              //re-add the last item - unshortened - to the array , and return that.
              var lastItem = strArray.slice(strArray.length-1);
              if (allButTheLastItem) {
                allButTheLastItem.push(lastItem[0]);
              }
              console.log('shorten everything but the last one.');
              return accept(allButTheLastItem);
            }
              });
              
              
            
          } else {
            //everything fits, no need to shorten anything
            console.log('everything fits off the bat');
            return accept(strArray);
          }
        }, 1500); 
      });
    },
    _getSmallStrs(items, map) {
      return items.map((item) => {
        item.text = map.get(item).shortText;
      });
    },
    _createCanvas() {
      var canvas = document.createElement('canvas');
      canvas.height = 20;
      canvas.width = 9999;
      this._measurementCanvas = canvas;
      var ctx = this._measurementCanvas.getContext('2d');
      ctx.font = "15px GE Inspira Sans";
      this.set('ctx', ctx) ;
    },
    /**
     * This method accepts the path array, and loops through it recursively
     * looking for anything with more than 16 characters.
     * 
     * once it finds a long asset name, it shortens it.
     * @param {Object} pathArray 
     * @return {Array} PathArray  - the modified array with the shortened names in it.
     */
    _shortenLongAssetNames(pathArray, map) {

      //loop through each item
        for (var i=0, len = pathArray.length; i<len;i++) {

            var item = map.get(pathArray[i]) || {};

            //either save the shortened version, or the full version of the text
            item.shortText = (pathArray[i].text.length > 16) ? this._returnShortenString(pathArray[i].text) : pathArray[i].text;
            
            map.set(pathArray[i], item);

          //make sure to search through the children as well by calling this recursively
          if (pathArray[i].children) {
            this._shortenLongAssetNames(pathArray[i].children, map);
          }
      }
      //once we're done, return with the modified map
      return map;
       
    },
    /**
     * This method accepts an obj that has more than 16 characters in its text, and 
     * returns the shortened version of that text.
     * @param {Obj} pathItem 
     * @return {Promise} shortenedString
     */
    _returnShortenString(itemText) {
        var beginning = itemText.subitemText(0,6),
        middle = "...",
        end = itemText.subitemText(itemText.length-6);
        return beginning + middle + end;
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
     * previously had, and calls a set on the new selectedItem 
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
    _onPathTap(evt) {
      var dataItem = evt.model.item;

      /* on tap, we need to find out if the clicked item is the same as before.
      * if it is, we make the dropdown go way.
      * if it is not, we save the new clicked item.
      */

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
})();
