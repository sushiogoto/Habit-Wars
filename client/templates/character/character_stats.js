Template.characterStats.helpers({
  character: function () {
    user = Meteor.user();
    return Characters.findOne({userId: user._id});
  }
});