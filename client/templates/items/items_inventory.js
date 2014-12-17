var itemsGridDep = new Tracker.Dependency();

Template.itemsInventory.helpers({
  inventory: function () {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var items = Inventories.findOne({characterId: character._id}).items;
    items.forEach(function(item) {
      item.shouldDisplay = item.quantity > 0 || item.equipped;
    });
    return items;
  },
  inventoryTableData: function() {
    var character = Characters.findOne({userId: Meteor.userId()});
    var inventory = Inventories.findOne({characterId: character._id});

    var flatItemsGrid = _.flatten(inventory.itemsGrid);
    var inventoryItemsIds = _.pluck(inventory.items, '_id');
    var itemsNotInGrid = _.difference(inventoryItemsIds, flatItemsGrid);

    inventory.itemsGrid.forEach(function(row, x) {
      row.forEach(function(column, y) {
        var itemsGridUpdate = inventory.itemsGrid;
        if(column === null && itemsNotInGrid.length > 0) {
          column = itemsNotInGrid.pop();
          itemsGridUpdate[x][y] = column;
          var item = Items.findOne({_id: column});
          Inventories.update(inventory._id, {$set: {itemsGrid: itemsGridUpdate}});
        }
        else if(!_.contains(inventoryItemsIds, column)) {
          itemsGridUpdate[x][y] = null;
          Inventories.update(inventory._id, {$set: {itemsGrid: itemsGridUpdate}});
        }
      });
    });
    return inventory.itemsGrid;
  }
});

Template.itemsInventory.events({
  'click .equipItem': function () {
    Meteor.call('equipUnequipItem', this._id, function (error, result) {console.log(result);});
  },

  'click .sellItem': function () {
    Meteor.call('sellItem', this._id, function (error, result) { console.log(result); });
  },
  'mousedown .item': function() {
    console.log(this);
    Session.set('moving_itemobject', this._id);
  },
});

Template.itemsInventory.rendered = function () {
  var character = Characters.findOne({userId: Meteor.userId()});
  var inventory = Inventories.findOne({characterId: character._id});


  Tracker.autorun(function () {
    itemsGridDep.depend();
    console.log('draggable');
    $('.item').draggable({
      snap: ".inventory-table-cell",
      snapMode: "inner",
      snapTolerance: 30,
      stop: function(event, ui) {
        console.log('stop handler');
        inventory = Inventories.findOne({characterId: character._id});
        // var offset = $('.inventory-table').offset();
        // var left = ui.position.left;
        // var top = ui.position.top;
        var itemId = $(event.target).data('item-id');
        var invTableOffsetTop = $('.inventory-table').offset().top;
        var invTableOffsetLeft = $('.inventory-table').offset().left;
        var cursorPosTop = event.pageY;
        var cursorPosLeft = event.pageX;
        // flatItemsGridArray = _.flatten(inventory.itemsGrid);

        var convertPosToDivArrayPos = function(position) {
          return Math.floor(position/50);
        };

        console.log('left  : ' + cursorPosLeft);
        console.log('offset: ' + invTableOffsetLeft);
        var toRow = convertPosToDivArrayPos(cursorPosTop - invTableOffsetTop) - 2;
        var toCol = convertPosToDivArrayPos(cursorPosLeft - invTableOffsetLeft);
        if(toCol >= 0 && toRow >= -2 && toCol < 11) {
          Meteor.call('equipUnequipItem', $(event.target).data('item-id'), function (error, result) {console.log(result);});
        }
        if(toRow < 0 || toCol < 0 || toRow > 4 || toCol > 10) {
          toRow = 0;
          toCol = 0;
        }
        console.log("row: " + toRow);
        console.log("col: " + toCol);

        inventory.itemsGrid.forEach(function(row, fromRow) {
          row.forEach(function(column, fromCol) {
            if(column === itemId) {
              // console.log('it works: ' + column);
              // console.log('fromRow: ' + fromRow);
              // console.log('fromCol: ' + fromCol);
              var temp = inventory.itemsGrid[toRow][toCol];
              inventory.itemsGrid[toRow][toCol] = inventory.itemsGrid[fromRow][fromCol];
              inventory.itemsGrid[fromRow][fromCol] = temp;
            }
          });
        });

        $(event.target).css({'top': 1, 'left': 1});
        Inventories.update(inventory._id, {$set: {itemsGrid: inventory.itemsGrid}});

      }
    });
  });
};

Template.itemsInventory.moving_itemobject = function() {
  return Session.equals('moving_itemobject', this._id);
};

Template.itemCell.helpers({
  column: function() {
    if (this instanceof String) {

      return true;
    } else {
      return false;
    }
  },

  itemId: function() {
    itemsGridDep.changed();
    return this.toString();
  },

  item: function() {
    var inventory = Inventories.findOne({characterId: util.currentCharacter()._id});
    var item = _.findWhere(inventory.items, {_id: this.toString()});
    if(item) {
      item.shouldDisplay = item.quantity > 0 || !item.equipped;
    }
    return item;
  },
  itemStats: function() {
    var inventory = Inventories.findOne({characterId: util.currentCharacter()._id});
    var item = _.findWhere(inventory.items, {_id: this.toString()});
    var itemStats = "Name: " + item.name + "\nType:" + item.type + "\nMaterial:" + item.material +
    "\nHlth:" + item.health + "\nStr:" + item.strength + "\nInt:" + item.intelligence + "\nQuantity:" + item.quantity +
    "\nPrice:" + item.price;
    return itemStats;

    // item.shouldDisplay = item.quantity > 0 || item.equipped;
  }
});

Template.itemCell.rendered = function() {
  $('[data-toggle="popover"]').popover({
      trigger: 'hover',
          'placement': 'top'
  });
};
