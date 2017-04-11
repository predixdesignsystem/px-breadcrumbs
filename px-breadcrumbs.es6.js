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
    attached() {
      this.prepareData();
    },
    observers: ['prepareData(_selectedItem)'],
    /**
     * This method has a chain of promises that process the data as needed.
     */
    prepareData() {
      this._calculatePath()
      .then((pathArray) => this._breadcrumbsDisplayOptions(pathArray))
      .then((pathArray) => {
        this.set('_mainPathItems', pathArray);
      });
    },
    _calculateSizeOfBreadcrumbs(strArray) {
      
      if (strArray) {
        var accumulativeSizeOfBreadcrumbs = 0,
        ctx = this._createCanvas();
        for (var i=0; i<strArray.length;i++) {
          accumulativeSizeOfBreadcrumbs += parseInt(ctx.measureText(strArray[i].text).width,10);
          //if the item has children, we need to the size of the down chevron.
          if (strArray[i].children) {
            accumulativeSizeOfBreadcrumbs += 11;
          }
          //we need to also add 15 pixels for the angle right
          if (i !==strArray.length -1) {
            accumulativeSizeOfBreadcrumbs += 15;
          }
        }
        return accumulativeSizeOfBreadcrumbs;
      } else {
        return [];
      }
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
        var ctx = this._createCanvas(),
          accumulativeSizeOfAllBreadcrumbs = this._calculateSizeOfBreadcrumbs(strArray);
          Polymer.dom.flush();
          this.async(() => {
            var breadcrumbs = document.querySelector('px-breadcrumbs'),
                breadcrumbsContainer = Polymer.dom(breadcrumbs.root).querySelector('.container'),
                breadcrumbsUlContainer = Polymer.dom(breadcrumbsContainer).querySelector('ul'),
                bcUlContainerRect = breadcrumbsContainer.getBoundingClientRect(),
                ulWidth = bcUlContainerRect.width;
                
            // we check to see if the container (which is sized automatically to fill out the page)
            // can fit all the items in the breadcrumbs.
            if (ulWidth < accumulativeSizeOfAllBreadcrumbs) {
              
              var allButTheLastItem = this._shortenLongAssetNames(strArray.slice(0, strArray.length-1)),
                  sizeOfAllButLastItem = this._calculateSizeOfBreadcrumbs(allButTheLastItem),
                  lastItem = this._calculateSizeOfBreadcrumbs([strArray.slice(-1)]);
              
              //we want to find out if the container can now fit all of the shortened items + the last Item, that wasn't shortened
              if (ulWidth < sizeOfAllButLastItem + lastItem) {
                //it doesn't fit, so, we go to second option.
                var shortenAllItems = this._shortenLongAssetNames(strArray),
                    sizeOfAllShortenedItem = this._calculateSizeOfBreadcrumbs(shortenAllItems);
                
                //we check if we can fit after we've shortened all the items
                if (ulWidth < shortenAllItems) {
                  //looks like we can't fit them, even after shortening them all. 
                  //time for option 3.
                  //i'm setting a random high number to start with
                  var shortenAllItemsWithOverflow = 99999,
                      overflowArray =stArray;
                  //keep looping until all the items fit into the container
                  while (ulWidth < shortenAllItemsWithOverflow) {
                    //we remove the first item - mutating strArray, and returning the item
                    //which then gets pushed into overflowArray, giving us an array of the items we
                    //had to cut out once this loop is done.
                    overflowArray.push(strArray.shift());
                    shortenAllItemsWithOverflow = this._calculateSizeOfBreadcrumbs(strArray);
                  }
                  var overflowObj = {
                    "text": "...",
                    "children": overflowArray
                  }
                  //this pushes the overflowObj to the beginning of the array.
                  strArray.unshift(overflowObj);
                  return accept(strArray);
                } else {
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
                return accept(allButTheLastItem);
              }
            } else {
              //everything fits, no need to shorten anything
              console.log('everything fits off the bat');
              return accept(strArray);
            }
          }, 1500);
          
      });
    },
    _createCanvas() {
      var canvas = document.createElement('canvas');
      canvas.height = 20;
      canvas.width = 9999;
      this._measurementCanvas = canvas;
      var ctx = this._measurementCanvas.getContext('2d');
      ctx.font = "15px GE Inspira Sans";
      return ctx;
    },
    _isTextShorteningNecessery(pathArray) {
      console.log('pathArray');
      console.log(pathArray);
    },
    /**
     * This method accepts the path array, and loops through it recursively
     * looking for anything with more than 16 characters.
     * 
     * once it finds a long asset name, it shortens it.
     * @param {Object} pathArray 
     * @return {Promise} PathArray 
     */
    _shortenLongAssetNames(pathArray) {
        //loop through each item
        for (var i=0, len = pathArray.length; i<len;i++) {
          //looking for anything that's over 16 characters.
          if (pathArray[i].text.length > 16) {
            //get the shotened version of the text
            this._returnShortenString(pathArray[i])
            .then((obj) => {
              //and save it into the correct path.
              var path = obj.path,
                  shortenedString = obj.text;
              path.text = shortenedString;
            });
        } else {
          //make sure to search through the children as well by calling this recursively
          if (pathArray[i].children) {
            this._shortenLongAssetNames(pathArray[i].children);
          }
          //once we're done, return the promise with the modified pathArray
          return pathArray;
        }
      }
    },
    /**
     * This method accepts an obj that has more than 16 characters in its text, and 
     * returns the shortened version of that text.
     * @param {Obj} pathItem 
     * @return {Promise} shortenedString
     */
    _returnShortenString(pathItem) {
      return new Promise((accept, reject) => {
        var string = pathItem.text,
        beginning = string.substring(0,6),
        middle = "...",
        end = string.substring(string.length-6);
      
        return accept({"text": beginning + middle + end, "path": pathItem});
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
      this._selectedItem.selectedItem = false;
    },
    /**
     * This method is called on load, to calculate the initial Path, 
     * everytime a breadcrumb is clicked.
     * it recursively builds the path, while looking for the 
     * selectedItem.
     */
    _calculatePath() {
      return new Promise((fulfill, reject) => {
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
                self.set('_selectedItem', pathItem[i]);
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

        //once all the recursion is done, we can set the value of 
        //_mainPathItems
        return fulfill(pathArray);
      });
    },
   
    /**
     * This function checks whether the item in question has children.
     * @param {*} itemInPath 
     */
    _doesItemHaveChildren(itemInPath) {
      return itemInPath.hasChildren;
    },
    /**
     * This function is used to determine whether we are on the last Item in the array. - if 
     * the index is the last item in the aray (length -1), we return false.
     * @param {*} index 
     */
    _isNotLastItemInData(index) {
      return this._mainPathItems.length-1 !== index;
    },
    /**
     * This function is used to determine the correct classes that need to be passed in - if 
     * the index is the last item in the aray, we want it to be bold, so we pass the selected class.
     * 
     * @param {*} index This represents the index of the item we are looking at in the array.
     */
    _calculatePathclass(index) {
      return !this._isNotLastItemInData(index) ?  ' selected' : '';
    },
    /**
     * this method call a reset on whatever selected Item we 
     * previously had, and call a set on the new selectedItem 
     * @param {*} evt the click event from the dropdown item clicked
     */
    _dropdownTap(evt) {
      this._resetSelectedItem();
      console.log(evt);
      var newSelectItem = evt.model.item;
      this._setSelectedItem(newSelectItem);
      //this hides the dropdown
      this.set('_isDropdownHidden', true);
      //and this clears out the field that hold the previously clicked
      //path item.
      this.set('_clickPathItem', {});
    },
    /**
     * This method sets a _selectedItem set from the passed object.
     * @param {Object} selectedItem the new selected item
     */
    _setSelectedItem(selectedItem) {
      selectedItem.selectedItem = true;
      this.set('_selectedItem', selectedItem);
      console.log(selectedItem);
    },
    _onPathTap(evt) {
      console.log('path click');
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
      if (this._clickPathItem === dataItem) {
        console.log('this._clickPathItem === evt.model.item');
        this.set('_isDropdownHidden', true);
        this.set('_clickPathItem', {});
      } else {
        console.log('else');
        this.set('_clickPathItem', dataItem);
        this.set('_isDropdownHidden', false);
        this._changeDropdownPosition(evt);
      }
      // 1. Check if there are children. 

      if (this._doesItemHaveChildren(dataItem)) {
        this.set('_clickedItemChildren', dataItem.children);
      }
      
      
        // a. If there are kids, we need to update clickedItemChildren. 
        // b. If not, we fire an event that the clicked on item is the selected context.
      // 2. If there are children, we need to find the left/top/height of the clicked item, and calculate the positioning of the dropdown accordingly 
    },
    
    /**
     * 
     * @param {Object} clickedItem the clicked item
     * @return Object that holds the calculated top/left for the dropdown.
     */
    extractClickedPathItemPosition(clickedItem) {
      //TODO extract top/left/height from clickedItem.
      // then, calculate the new positioning, and save it into an object.
      // returns an object that holds the new top/left positioning.
    },
    /**
     * 
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
      console.log(targetRect);
      dropdown.style.top = (targetBottom + windowScrollY + 4) + 'px';
      dropdown.style.left = targetLeft + windowScrollX + 'px';
      
    },
    /**
     * This method dispatches a custom event ('px-breadcrumbs-item-clicked') that has the item attached to it.
     * the 'composed: true' property makes it so the event passes through shadow dom boundaries.
     * @param {*} item the item that was clicked on.
     */
    _notifyClick(item) {
      //TODO fire an event with the clicked on item.
      this.dispatchEvent(new CustomEvent('px-breadcrumbs-item-clicked', {item: item, composed: true}));
    }
  });
})();
