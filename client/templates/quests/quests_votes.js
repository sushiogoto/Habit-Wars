Template.questsVotes.helpers({
  questsToVote: function() {
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    var quests = Quests.find({groupId: group._id, status: "pending"}).fetch();
    var result = [];
    quests.forEach(function(quest){
      if (quest.accepted.indexOf(character._id) < 0 && quest.declined.indexOf(character._id) < 0) {
        result.push(quest);
      }
    });
    return result;
  }
});

Template.questVoteItem.events({
  'click .accept': function() {
    Meteor.call('groupQuestVote', 'accept', this._id, function (error, result) {});
  },
  'click .decline': function() {
    Meteor.call('groupQuestVote', 'decline', this._id, function (error, result) {});
  }
});