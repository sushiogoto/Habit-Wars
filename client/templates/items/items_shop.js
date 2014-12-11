Template.itemsShop.helpers({
  shopItems: function () {
    return Items.find();
  }
});

Template.itemsShop.events({
  'click .buyItem': function () {
    Meteor.call('purchaseItem', this._id, function (error, result) {});
  }
});