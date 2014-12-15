Template.questsIndex.events({
  'click .easy-quest': function(e) {
    e.preventDefault();
    Meteor.call('questInit', 'easy', function (error, result) {});
  }
});

Template.questsIndex.rendered = function() {
  var user = Meteor.user();
  var quest = Quests.findOne({userId: user._id, status: "active"});

  // add a day
  if(quest) {
    var questEndDate = moment(quest.startDate).add(quest.questDuration , 'd');
    var dateToday = moment();
    var endQuest = moment(questEndDate).isBefore(dateToday);
    if(endQuest) {
      Meteor.call('questEnd', function (error, result) {});
    }
  }

};