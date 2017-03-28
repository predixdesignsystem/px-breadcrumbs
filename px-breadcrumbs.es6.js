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
      mainPathItems: {
        type: Array,
        value: function() {return [];},
        computed: '_computeMainPath(breadcrumbData)'
      },
      _clickItem: {
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
      }
    },
    _computeMainPath(currentDataObj) {
      console.log(currentDataObj);
      var pathArray = [];
      // if (currentDataObj.children) {
      //   PathArray.push(currentDataObj)
      // }
      var recursiveLoopThroughObj = function(pathItem) {
        console.log(pathItem);
        for (var i=0; i<pathItem.length;i++) {
          debugger;
          if (pathItem[i].children) {
            pathArray.push(pathItem[i]);
            recursiveLoopThroughObj(pathItem[i].children)
          } else {
            if (pathItem[i].selectedItem) {
              pathArray.push(pathItem[i]);
            }
          }
        }
      };
      recursiveLoopThroughObj(currentDataObj);
      console.log('pathArray');
      console.log(pathArray);
      return pathArray;
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
      return this.mainPathItems.length-1 !== index;
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
    _onPathTap(evt) {
      var dataItem = evt.model.item;
      // on tap, we need to:
      // 0. find out if the clicked item is the same as before.
      // if it is, we make the dropdown go way.
      //if it is not, we save the new clicked item.
      console.log(this._clickItem === evt.model.item);
      if (this._clickItem === evt.model.item) {
        this.set('_isDropdownHidden', true);
        this.set('_clickItem', {});
      } else {
        this.set('_clickItem', dataItem);
        this.set('_isDropdownHidden', false);
      }
      
      // 1. Check if there are children. 
        console.log(evt.model.item);

        if (this._doesItemHaveChildren(dataItem)) {
          this.set('_clickedItemChildren', dataItem.children);
          console.log('set children ');
          console.log(dataItem.children);
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
    calculateDropdownPosition(clickedItem) {
      //TODO extract top/left/height from clickedItem.
      // then, calculate the new positioning, and save it into an object.
      // returns an object that holds the new top/left positioning.
    },
    /**
     * 
     * @param {Object} positioning an object which holds the new positioning for the dropdown
     */
    changeDropdownPosition(positioning) {
      //TODO find out if we are hitting the window edge. 
      //if we aren't, change the position of the dropdown to be under the clicked item
      //if we are, have smart positioning, 
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
