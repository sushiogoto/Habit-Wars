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
    Meteor.call('groupQuestInit', 'easy', function (error, result) {});
  },

  'click .medium-group-quest-init': function() {
    Meteor.call('groupQuestInit', 'medium', function (error, result) {});
  },

  'click .hard-group-quest-init': function() {
    Meteor.call('groupQuestInit', 'hard', function (error, result) {});
  },
});
