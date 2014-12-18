Template.itemsEquipped.helpers({

  itemStats: function() {
    var inventory = Inventories.findOne({characterId: util.currentCharacter()._id});
    var item = _.findWhere(inventory.items, {_id: this.toString()});
    var itemStats = "Name: " + item.name + "\nType:" + item.type + "\nMaterial:" + item.material +
    "\nHlth:" + item.health + "\nStr:" + item.strength + "\nInt:" + item.intelligence + "\nQuantity:" + item.quantity +
    "\nPrice:" + item.price;
    return itemStats;

    // item.shouldDisplay = item.quantity > 0 || item.equipped;
  },

  equipments: function () {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var items = Inventories.findOne({characterId: character._id}).items;
    var equippedItems = _.where(items, {equipped: true});

    var findType = function(itemType){
      var item = _.where(equippedItems, {type: itemType})[0];
      if(item) {
        item.tooltip = "Name: " + item.name + "\nType:" + item.type + "\nMaterial:" + item.material +
        "\nHlth:" + item.health + "\nStr:" + item.strength + "\nInt:" + item.intelligence + "\nQuantity:" + item.quantity +
        "\nPrice:" + item.price;
      }
      return item;
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
    Meteor.call('equipUnequipItem', itemId, function (error, result) {});
  }
});

Template.itemsEquipped.rendered = function() {
  $('[data-toggle="popover"]').popover({
      trigger: 'hover',
          'placement': 'top'
  });
};
