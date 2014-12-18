Template.itemsEquipped.helpers({
  equipments: function () {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var items = Inventories.findOne({characterId: character._id}).items;
    var equippedItems = _.where(items, {equipped: true});

    var findType = function(itemType){
      return _.where(equippedItems, {type: itemType})[0];
    };

    var equipments = {
      head:     findType("head"),
      chest:    findType("chest"),
      hands:    findType("hands"),
      legs:     findType("legs"),
      feet:     findType("feet"),
      mainHand: findType("mainHand"),
      offHand:  findType("offHand")
    };

    return equipments;
  }
});

Template.itemsEquipped.events({
  'click .unEquipItem': function (event) {
    itemId = $(event.target).data('item-id');
    Meteor.call('equipUnequipItem', itemId, this._id, function (error, result) {});
  }
});