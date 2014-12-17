Template.questsVotes.helpers({
  questsToVote: function() {
    var character = util.currentCharacter();
    var group = Groups.findOne({members: character._id});
    if (!group) {
      return [];
    }
    var quests = Quests.find({groupId: group._id, status: "pending"}).fetch();
    var result = [];
    quests.forEach(function(quest){
      if (quest.accepted.indexOf(character._id) < 0 && quest.declined.indexOf(character._id) < 0) {
        // quest.createdBy = Users.findOne({_id: quest.accepted[0]}).profile.name;
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

Template.questVoteItem.helpers({
  questVoters: function() {
    var voters = _.map(this.accepted, function(charId) {
      return Characters.findOne({_id: charId}).name;
    });
    return voters.join(', ');
  }
});