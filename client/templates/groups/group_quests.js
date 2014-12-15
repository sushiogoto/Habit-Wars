Template.groupQuests.helpers({
  activeGroupQuest: function() {
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    return Quests.findOne({groupId: group._id, status: "active"});
  }
});

Template.groupQuests.events({
  'click .attack': function() {
    Meteor.call('questAttack', 'group', function (error, result) {});
  }
});