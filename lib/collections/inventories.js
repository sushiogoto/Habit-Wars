Inventories = new Mongo.Collection('inventories');

Meteor.methods({
  modifyItem: function(itemId, modification) {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var item = Items.findOne({_id: itemId});
    var characterInventoryId = Inventories.findOne({characterId: character._id})._id;
    var characterInventory = Inventories.findOne({characterId: character._id}).items;

    var strippedItem = _.omit(item, "quantity");
    var strippedItemValues = _.values(strippedItem);
    var hasSameItem = false;

    for(var i = 0; i < characterInventory.length; i++){
      var inventoryItem = characterInventory[i];
      var strippedInventoryItem = _.omit(inventoryItem, "quantity");
      var strippedInventoryItemValues = _.values(strippedInventoryItem);
      var isDifferentItem = _.difference(strippedInventoryItemValues, strippedItemValues);
      if(isDifferentItem.length === 0) {
        hasSameItem = true;
        if(modification == "add") {
          inventoryItem.quantity += 1;
        } else {
          inventoryItem.quantity -= 1;
        }

        break;
      }
    }

    if(!hasSameItem && modification == "add") {
      characterInventory.push(item);
    } else if (!hasSameItem && modification == "remove") {
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
  actionItem: function(itemId){
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var inventory = Inventories.findOne({characterId: character._id});
    var equipInventory = EquippedInventories.findOne({characterId: character._id});
    var item = Items.findOne({_id: itemId});
    var itemType = item.type;
    var action;

    // var pluckedItemFromEquip = _.pluck(equipInventory.items, itemType);

    if (item._id === equipInventory.items[itemType]._id){
      equipInventory.items[itemType] = {};
      action = "unequip";
      Meteor.call("modifyItem", item._id, "add", function(error, result) {});

    } else {
      equipInventory.items[itemType] = item;
      action = "equip";
      Meteor.call("modifyItem", item._id, "remove", function(error, result) {});
    }

    var equipInventoryId = equipInventory._id;
    var equippedInventoryAttributes = _.omit(equipInventory, "_id");

    EquippedInventories.update(equipInventoryId, {$set: equippedInventoryAttributes});
    return action;
  },
});