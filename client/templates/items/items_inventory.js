Template.itemsInventory.helpers({
  inventory: function () {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var items = Inventories.findOne({characterId: character._id}).items;
    items.forEach(function(item) {
      item.shouldDisplay = item.quantity > 0 || item.equipped;
    });
    return items;
  }
});

Template.itemsInventory.events({
  'click .equipItem': function () {
    Meteor.call('equipUnequipItem', this._id, function (error, result) {console.log(result);});
  },

});