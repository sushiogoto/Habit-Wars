Template.rpgGameShopItem.events({
  'click .buyItem': function () {
    console.log(this);
    // Meteor.call('purchaseItem', this._id, function (error, result) {});
  },
});

Template.rpgGameShopItem.helpers({
  shopItems: function () {
    return Items.find({random: false});
  },
});