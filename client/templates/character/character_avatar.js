Template.characterAvatar.helpers({
  character: function () {
    user = Meteor.user();
    return Characters.findOne({userId: user._id});
  }
});