Template.questActive.helpers({
  currentQuest: function() {
    return Quests.findOne({userId: Meteor.user()._id, status: "active"});
  }
});

Template.questActive.events({
  'click .attack': function() {

    Meteor.call('questAttack', 'solo', function (error, result) {});
  }
});