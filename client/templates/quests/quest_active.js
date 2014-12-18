Template.questActive.created = function() {
  Session.set('attackAlert', {});
};

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
  alertMessage: function(field) {
    return Session.get('attackAlert')[field];
  },
  attackClass: function (field) {
    return !!Session.get('attackAlert')[field] ? 'has-alert' : '';
  },
  modalReward: function() {
    return Session.get('soloQuestMonsterData');
  },
  currentSoloQuest: function() {
    var soloQuest = util.questForCurrentCharacter('solo');
    return soloQuest;
  },

  currentSoloMonster: function() {
    // throwAlert("poop"); THROW ALERT FOR DAMAGE AND XP AND STUFF YO
    var quest = util.questForCurrentCharacter('solo');
    if(quest) {
      var monster = Monsters.findOne({_id: quest.monsterId});
      Session.set('soloQuestMonsterData', monster);
      Session.set('soloQuestRewardShown', false);
      return monster;
    } else if (Session.get('soloQuestRewardShown') === false) {
      $('#myModal').modal({show: true});
      Session.set('soloQuestRewardShown', true);
      return null;
    } else {
      return null;
    }
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
    Meteor.call('questAttack', 'solo', function (error, result) {
      var image = result.gold + ' x <img src="images/coin.png" height="20" width="20">';
      $('.gold').data("content", result.gold);
      $('.gold').popover({'placement': 'bottom', content: image, html: true});
      $('.gold').popover('show');
      throwAlert(result.damage);

      setTimeout(function(){
        $('.gold').popover('hide');
      }, 4000);


      // $('.gold').popover('hide');

    });
  },

  'click .groupQuestAttack': function() {
    Meteor.call('questAttack', 'group', function (error, result) {});
    var image = result.gold + ' x <img src="images/coin.png" height="20" width="20">';
    $('.gold').data({"content": result.gold});
    $('.gold').popover({'placement': 'bottom', content: image, html: true});
    $('.gold').popover('show');

    setTimeout(function(){
      $('.gold').popover('hide');
    }, 4000);
  }
});
