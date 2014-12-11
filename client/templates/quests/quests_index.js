Template.questsIndex.events({
  'click .easy-quest': function(e) {
    e.preventDefault();
    Meteor.call('questInit', 'easy', function (error, result) {});
  }
});