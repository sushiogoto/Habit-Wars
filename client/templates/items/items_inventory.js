Template.itemsInventory.helpers({
  inventory: function () {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    return Inventories.findOne({characterId: character._id}).items;
  }
});

Template.itemsInventory.events({
  'click .equipItem': function () {
    Meteor.call('actionItem', this._id, function (error, result) {console.log(result);});
    // var user = Meteor.user();
    // var character = Characters.findOne({userId: user._id});
    // var equippedInventory = EquippedInventories.findOne({characterId: character._id});
    // var equippedInventoryItems = equippedInventory.items;

    // equippedInventoryItems[this.type] = this;
    // EquippedInventories.update(equippedInventory._id, {$set: {items: equippedInventoryItems}});
  },

});