Template.questActive.rendered = function () {

  var characterId = Characters.findOne({userId: Meteor.userId()})._id;
  var soloQuest = Quests.findOne({userId: Meteor.user()._id, status: "active"});
  var groupQuest = Quests.findOne({groupId: Groups.findOne({members: characterId})._id, status: "active"});

  soloQuestCountDown = function(){
    var time_left = moment(soloQuest.startDate).add(soloQuest.questDuration, 'd') - moment();
    var hours = Math.floor(time_left / (1000 * 60 * 60));
    var minutes = Math.floor((time_left - (hours * (1000 * 60 * 60))) / (1000 * 60));
    var seconds = Math.floor((time_left - (hours * (1000 * 60 * 60)) - (minutes * 1000 * 60)) / 1000);
    Session.set('soloQuestRemainingTimePretty', hours + " hrs " + minutes + " min " + seconds + " sec");
    Meteor.setTimeout(soloQuestCountDown, 500);
  };


  groupQuestCountDown = function(){
    var time_left = moment(groupQuest.startDate).add(groupQuest.questDuration, 'd') - moment();
    var hours = Math.floor(time_left / (1000 * 60 * 60));
    var minutes = Math.floor((time_left - (hours * (1000 * 60 * 60))) / (1000 * 60));
    var seconds = Math.floor((time_left - (hours * (1000 * 60 * 60)) - (minutes * 1000 * 60)) / 1000);
    Session.set('groupQuestRemainingTimePretty', hours + " hrs " + minutes + " min " + seconds + " sec");
    Meteor.setTimeout(groupQuestCountDown, 500);
  };

  soloQuestCountDown();
  groupQuestCountDown();

};

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

  currentGroupQuest: function() {
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    return Quests.findOne({groupId: group._id, status: "active"});
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
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    var quest = Quests.findOne({groupId: group._id, status: "active"});
    return Monsters.findOne({_id: quest.monsterId});
  },

  currentGroupMonsterFullHealth: function() {
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    var quest = Quests.findOne({groupId: group._id, status: "active"});
    var monster = Monsters.findOne({_id: quest.monsterId});
    var subMonstersHealth = _.pluck(monster.subMonsters, "fullHealth");
    var totalHealth = subMonstersHealth.reduce(function(a,b){
      return a + b;
    });
    return totalHealth;
  },

  currentGroupXPReward: function() {
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    var quest = Quests.findOne({groupId: group._id, status: "active"});
    var monster = Monsters.findOne({_id: quest.monsterId});
    return monster.subMonsters[character._id].XP;
  },

  currentGroupGoldReward: function() {
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    var quest = Quests.findOne({groupId: group._id, status: "active"});
    var monster = Monsters.findOne({_id: quest.monsterId});
    var subMonstersGold = _.pluck(monster.subMonsters, "gold");
    return monster.subMonsters[character._id].gold;
  },

  currentGroupMonsterHealthPercentage: function() {
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    var quest = Quests.findOne({groupId: group._id, status: "active"});
    var monster = Monsters.findOne({_id: quest.monsterId});
    var subMonstersHealth = _.pluck(monster.subMonsters, "fullHealth");
    var totalHealth = subMonstersHealth.reduce(function(a,b){
      return a + b;
    });
    return Math.floor(monster.health / totalHealth * 100);
  },

  groupQuestTimeRemaining: function() {
    return Session.get('groupQuestRemainingTimePretty');
  }
});

Template.questActive.events({
  'click .soloQuestAttack': function() {
    Meteor.call('questAttack', 'solo', function (error, result) {});
  },

  'click .groupQuestAttack': function() {
    Meteor.call('questAttack', 'group', function (error, result) {});
  }
});