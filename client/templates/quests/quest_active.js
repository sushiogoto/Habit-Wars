Template.questActive.helpers({
  currentQuest: function() {
    return Quests.findOne({userId: Meteor.user()._id, active: true});
  }
});

Template.questActive.events({
  'click .attack': function() {

    Meteor.call('questAttack', function (error, result) {});
  }
});