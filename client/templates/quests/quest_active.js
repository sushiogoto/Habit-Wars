Template.questActive.helpers({

  currentSoloQuest: function() {
    return Quests.findOne({userId: Meteor.user()._id, status: "active"});
  },

  currentSoloMonster: function() {
    var quest = Quests.findOne({userId: Meteor.user()._id, status: "active"});
    return quest ? Monsters.findOne({_id: quest.monsterId}) : null;
  },

  currentSoloMonsterHealthPercentage: function(){
    var quest = Quests.findOne({userId: Meteor.user()._id, status: "active"});
    var monster = Monsters.findOne({_id: quest.monsterId});
    return monster ? Math.floor(monster.health / monster.fullHealth * 100) : null;
  },

  soloQuestTimeRemaining: function() {
    return Session.get('soloQuestRemainingTimePretty');
  },

  groupQuestTimeRemaining: function() {
    return Session.get('groupQuestRemainingTimePretty');
  },

  currentGroupQuest: function() {
    var characterId = Characters.findOne({userId: Meteor.userId()})._id;
    var group = Groups.findOne({members: characterId});
    return Quests.fineOne({groupId: group._id});
  },

  currentGroupMembers: function(){
    var characterId = Characters.findOne({userId: Meteor.userId()})._id;
    var group = Groups.findOne({members: characterId});
    var result = [];
    group.members.forEach(function(memberId){
      result.push(Characters.findOne({_id: memberId}));
    });
    return result;
  },

  currentGroupMonster: function(){
    var characterId = Characters.findOne({userId: Meteor.userId()})._id;
    var group = Groups.findOne({members: characterId});
    var quest = Quests.fineOne({groupId: group._id});
    return Monsters.findOne({_id: quest.monsterId});
  }
});

Template.questActive.events({
  'click .attack': function() {

    Meteor.call('questAttack', 'solo', function (error, result) {});
  }
});

Template.questActive.rendered = function () {

  var soloQuest = Quests.findOne({userId: Meteor.user()._id, status: "active"});
  soloQuestCountDown = function(){
    var time_left = moment(soloQuest.startDate).add(soloQuest.questDuration, 'd') - moment();
    var hours = Math.floor(time_left / (1000 * 60 * 60));
    var minutes = Math.floor((time_left - (hours * (1000 * 60 * 60))) / (1000 * 60));
    var seconds = Math.floor((time_left - (hours * (1000 * 60 * 60)) - (minutes * 1000 * 60)) / 1000);
    Session.set('soloQuestRemainingTimePretty', hours + " hrs " + minutes + " min " + seconds + " sec");
    Meteor.setTimeout(soloQuestCountDown, 500);
  };
  soloQuestCountDown();

  var group = Groups.findOne({members: characterId});
  var groupQuest = Quests.fineOne({groupId: group._id});
  groupQuestCountDown = function(){
    var time_left = moment(groupQuest.startDate).add(groupQuest.questDuration, 'd') - moment();
    var hours = Math.floor(time_left / (1000 * 60 * 60));
    var minutes = Math.floor((time_left - (hours * (1000 * 60 * 60))) / (1000 * 60));
    var seconds = Math.floor((time_left - (hours * (1000 * 60 * 60)) - (minutes * 1000 * 60)) / 1000);
    Session.set('groupQuestRemainingTimePretty', hours + " hrs " + minutes + " min " + seconds + " sec");
    Meteor.setTimeout(groupQuestCountDown, 500);
  };
  groupQuestCountDown();
};