Template.itemsEquipped.helpers({
  equipments: function () {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    // return _.pairs(EquippedInventories.findOne({characterId: character._id}).items);
    items = EquippedInventories.findOne({characterId: character._id}).items;
    return items;
  }
});