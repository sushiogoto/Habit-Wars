Inventories = new Mongo.Collection('inventories');

Meteor.methods({
  modifyItem: function(itemId, modification) {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var characterInventoryId = Inventories.findOne({characterId: character._id})._id;
    var characterInventory = Inventories.findOne({characterId: character._id}).items;

    var inventoryItem = characterInventory.filter(function (inventoryItem) {
      return inventoryItem._id === itemId;
    })[0];

    if(inventoryItem) {
      inventoryItem.quantity += (modification === "add") ? 1 : -1;
    } else if (!inventoryItem && modification === "add") {
      var item = Items.findOne({_id: itemId});
      var itemToAddToInventory = _.extend({equipped: false}, item);
      characterInventory.push(itemToAddToInventory);
    } else if (!inventoryItem && modification == "remove") {
      console.log("You can't remove something you don't own");
    }

    characterInventoryUpdates = {items: characterInventory};
    Inventories.update(characterInventoryId, {$set: characterInventoryUpdates});
  },

  purchaseItem: function(itemId) {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var item = Items.findOne({_id: itemId});

    if(character.gold >= item.price) {
      Meteor.call('modifyItem', itemId, "add", function (error, result) {});
      character.gold -= item.price;
    }

    Characters.update(character._id, {$set: {gold: character.gold}});

  },

  // This function equip and unequip items
  equipUnequipItem: function(itemId){
    var item = Items.findOne({_id: itemId});
    var action;

    var characterInventory = Inventories.findOne({
      characterId: Characters.findOne({userId: Meteor.user()._id})._id
    });

    var inventoryItem = characterInventory.items.filter(function (inventoryItem) {
      return inventoryItem._id === itemId;
    })[0];

    var equippedItemOfSameType = characterInventory.items.filter(function (inventoryItem) {
      return inventoryItem.type === item.type && inventoryItem.equipped;
    })[0];

    if (inventoryItem.equipped) {
      inventoryItem.equipped = false;
      inventoryItem.quantity += 1;
      action = "unequip";
    } else if(!inventoryItem.equipped && inventoryItem.quantity > 0) {
      if(equippedItemOfSameType) {
        equippedItemOfSameType.equipped = false;
        equippedItemOfSameType.quantity += 1;
      }
      inventoryItem.equipped = true;
      inventoryItem.quantity -= 1;
      action = "equip";
    }

    Inventories.update(characterInventory._id, {$set: {items: characterInventory.items}});

    return action;
  },
});