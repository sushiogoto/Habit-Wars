Template.questsIndex.events({
  'click .easy-quest': function() {
    Meteor.call('questInit', 'easy', function (error, result) {});
  }
});