Inventories = new Mongo.Collection('inventories');

Meteor.methods({
  purchaseItem: function(itemId) {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var item = Items.findOne({_id: itemId});
    var characterInventory = Inventories.findOne({characterId: character._id});

    if(character.gold >= item.price) {
      var strippedItem = _.omit(item, "_id", "quantity");
      var strippedItemValues = _.values(strippedItem);
      var hasSameItem = false;

      for(var key in characterInventory){
        var inventoryItem = characterInventory[key];
        var strippedInventoryItem = _.omit(inventoryItem, "_id", "quantity");
        var strippedInventoryItemValues = _.values(strippedInventoryItem);
        var isDifferentItem = _.difference(strippedInventoryItemValues, strippedItemValues);
        if(isDifferentItem.length === 0) {
          hasSameItem = true;
        }
      }
      if(!hasSameItem) {
        characterInventory[item.name] = _.omit(item, "_id", "name");
      } else {
        characterInventory[item.name].quantity += 1;
      }
      var updateCharacterInventory = _.omit(characterInventory, "_id", "characterId");
      Inventories.update(characterInventory._id, {$set: updateCharacterInventory});
    }
  }
});