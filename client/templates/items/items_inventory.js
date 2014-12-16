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
        if(column === null && itemsNotInGrid.length > 0) {
          var itemsGridUpdate = inventory.itemsGrid;
          column = itemsNotInGrid.pop();
          itemsGridUpdate[x][y] = column;
          var item = Items.findOne({_id: column});
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
  }
});

Template.itemsInventory.rendered = function () {
  var character = Characters.findOne({userId: Meteor.userId()});
  var inventory = Inventories.findOne({characterId: character._id});

  Tracker.autorun(function () {
  $('.item').draggable({
    snap: ".inventory-table-cell",
    snapMode: "inner",
    snapTolerance: 30,
    stop: function(event, ui) {
      itemsGridDep.depend();
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

      var toRow = convertPosToDivArrayPos(cursorPosTop - invTableOffsetTop);
      var toCol = convertPosToDivArrayPos(cursorPosLeft - invTableOffsetLeft);
      if(toRow < 0 || toCol < 0) {
        toRow = 0;
        toCol = 0;
      }

      inventory.itemsGrid.forEach(function(row, fromRow) {
        row.forEach(function(column, fromCol) {
          if(column === itemId) {
            var temp = inventory.itemsGrid[toRow][toCol];
            inventory.itemsGrid[toRow][toCol] = inventory.itemsGrid[fromRow][fromCol];
            inventory.itemsGrid[fromRow][fromCol] = temp;
          }
        });
      });

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
    return Items.findOne({_id: this.toString()});
  }
});
