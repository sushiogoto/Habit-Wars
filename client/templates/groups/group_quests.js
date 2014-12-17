Template.groupQuests.helpers({
  activeGroupQuest: function() {
    return util.questForCurrentCharacter('group');
  }
});

Template.groupQuests.events({
  'click .attack': function() {
    Meteor.call('questAttack', 'group', function (error, result) {});
  },

  'click .easy-group-quest-init': function() {
    Meteor.call('groupQuestVoteInit', 'easy', function (error, result) {});
  },

  'click .medium-group-quest-init': function() {
    Meteor.call('groupQuestVoteInit', 'medium', function (error, result) {});
  },

  'click .hard-group-quest-init': function() {
    Meteor.call('groupQuestVoteInit', 'hard', function (error, result) {});
  },
});
