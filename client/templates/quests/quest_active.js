Template.questActive.rendered = function () {

  var characterId = Characters.findOne({userId: Meteor.userId()})._id;
  var soloQuest, groupQuest;

  Tracker.autorun(function() {
    soloQuest = util.questForCurrentCharacter('solo');
    groupQuest = util.questForCurrentCharacter('group');
  });

  updateTimers = function(){
    soloQuest = soloQuest || util.questForCurrentCharacter('solo');
    groupQuest = groupQuest || util.questForCurrentCharacter('group');
    if (soloQuest) {
      Session.set('soloQuestRemainingTimePretty', util.questTimeRemaining(soloQuest));
    }
    if (groupQuest) {
      Session.set('groupQuestRemainingTimePretty', util.questTimeRemaining(groupQuest));
    }
    Meteor.setTimeout(updateTimers, 500);
  };

  updateTimers();

};

Template.questActive.helpers({

  currentSoloQuest: function() {
    return util.questForCurrentCharacter('solo');
  },

  currentSoloMonster: function() {
    var quest = util.questForCurrentCharacter('solo');
    return quest ? Monsters.findOne({_id: quest.monsterId}) : null;
  },

  currentSoloMonsterHealthPercentage: function(){
    var monster = util.monsterForCurrentCharacter('solo');
    return monster ? Math.floor(monster.health / monster.fullHealth * 100) : null;
  },

  soloQuestTimeRemaining: function() {
    return Session.get('soloQuestRemainingTimePretty');
  },

  currentGroupQuest: function() {
    return util.questForCurrentCharacter('group');
  },

  userIsInGroup: function() {
    return !!Groups.findOne({members: util.currentCharacter()._id});
  },

  currentGroupMembers: function(){
    var group = Groups.findOne({members: util.currentCharacter()._id});
    return Characters.find({_id: {$in: group.members}});
  },

  currentGroupMonster: function(){
    return util.monsterForCurrentCharacter('group');
  },

  currentGroupMonsterHealth: function() {
    return util.sumPropertyOfSubmonsters(util.monsterForCurrentCharacter('group'), 'health');
  },

  currentGroupMonsterFullHealth: function() {
    return util.sumPropertyOfSubmonsters(util.monsterForCurrentCharacter('group'), 'fullHealth');
  },

  currentGroupXPReward: function() {
    return util.shareOfGroupReward(util.monsterForCurrentCharacter('group'), 'XP');
  },

  currentGroupGoldReward: function() {
    return util.shareOfGroupReward(util.monsterForCurrentCharacter('group'), 'gold');
  },

  currentGroupMonsterHealthPercentage: function() {
    var monster = util.monsterForCurrentCharacter('group');
    return Math.floor(util.sumPropertyOfSubmonsters(monster, 'health') / util.sumPropertyOfSubmonsters(monster, 'fullHealth') * 100);
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
