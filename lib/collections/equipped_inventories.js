EquippedInventories = new Mongo.Collection('equippedInventories');

Meteor.methods({
  // actionItem: function(itemName){
  //   user = Meteor.user();
  //   inventory = Inventories.findOne({userId: user._id});
  //   equipInventory = EquippedInventories.findOne({userId: user._id});

  //   item = inventory[itemName];
  //   if(equipInventory[item.type] === {}) {
  //     equipInventory[item.type] = item;
  //   } else if (equipInventory[item.type]._id){

  //   }

  //   item.quantity -= 1;
  //   if(item.quantity === 0){
  //     inventory.update(inventory._id, {$unset: {itemName: 1}});
  //   }

  //   EquippedInventories.update(equipInventory._id, {$set: equipInventory});
  // },

  // unequipItem: function(itemName){
  //   user = Meteor.user();
  //   inventory = Inventories.findOne({userId: user._id});
  //   equipInventory = EquippedInventories.findOne({userId: user._id});

  //   item = inventory[itemName];
  //   equipInventory[item.type] = {};

  //   Meteor.call('addItem', item, function (error, result) {});
  //   item.quantity += 1;
  //   if(item.quantity === 0){
  //     inventory.update(inventory._id, {$unset: {itemName: 1}});
  //   }

  //   EquippedInventories.update(equipInventory._id, {$set: equipInventory});
  // },

  // equipList: function(){

  // }
});