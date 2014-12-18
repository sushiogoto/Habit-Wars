Quests = new Mongo.Collection('quests');

Meteor.methods({
  questInit: function(difficulty) {
    if (util.questForCurrentCharacter('solo')) {
      return "Solo quest already in progress.";
    }

    var character = util.currentCharacter();

    var baseReward = 100;
    var monsterId = Monsters.insert(
      util.createMonster(character, difficulty, baseReward)
    );

    var questStats = {
      characterId: character._id,
      monsterId: monsterId,
      difficulty: difficulty,
      status: "active",
      startDate: moment(),
      questDuration: 1
    };

    var questId = Quests.insert(questStats);
    return "Joined solo quest.";
  },

  randomItemReward: function(characterId, difficulty){

    var character = Characters.findOne({_id: characterId});
    var itemTypes = ["head", "chest", "hands", "legs", "feet", "mainHand", "offHand"];

    var material;

    var randomName = function(type) {
      var adjective = ["Iron", "Ice", "Fire", "Poison"];
      // var adjective = ["Iron", "Ice", "Fire", "Poison", "Adamantium", "Stone", "Sunsoul"];
      // var adjective = ["Destroyer", "Ice", "Fire", "Poison", "Valyrian Steel", "Desolation", "Sunsoul", "Rage-Blind", "Broken", "Stone"];
      var noun = {
        head: "Helmet",
        chest: "Armour",
        hands: "Gauntlet",
        legs: "Grieves",
        feet: "Boots",
        mainHand: "Sword",
        offHand: "Shield"
      };
      material = _.sample(adjective);
      return noun[type] + " of " + material;
    };

    var type = _.sample(itemTypes);

    var rewardItem = Items.insert({
      name:          randomName(type),
      type:          type,
      material:     material,
      health:        Math.floor(0.3 * util.randomRangeForDifficulty(difficulty, character.max_health)),
      strength:      Math.floor(0.5 * util.randomRangeForDifficulty(difficulty, character.strength)),
      intelligence:  Math.floor(0.5 * util.randomRangeForDifficulty(difficulty, character.intelligence)),
      quantity:      1,
      price:         Math.floor(util.randomRange(50)),
      random:        true
    });
    Meteor.call('modifyItem', rewardItem, 'add', character._id, function(error, result){});
  },

  soloReward: function(characterId, questId) {
    var character = Characters.findOne({_id: characterId});
    var quest =  Quests.findOne({_id: questId, status: 'active'});
    var monster = Monsters.findOne({_id: quest.monsterId});
    character.gold      += monster.gold;
    character.XP += monster.XP;
    console.log("Im in soloReward");
    Characters.update(character._id, {$set: {gold: character.gold, XP: character.XP}});
    Meteor.call('randomItemReward', character._id, quest.difficulty, function(error, result){} );
  },

  groupReward: function(characterId){
    var group = Groups.findOne({members: characterId});
    var groupMembers = group.members;
    var quest = Quests.findOne({groupId: group._id, status: 'active'});
    var monster = Monsters.findOne({_id: quest.monsterId});
    console.log("Im in groupReward");
    groupMembers.forEach(function (member) {
      // add each character's share of the total XP or gold to this character
      var character = Characters.findOne({_id: member});
      ['gold', 'XP'].forEach(function(rewardType) {
        character[rewardType] += util.shareOfGroupReward(monster, rewardType);
      });
      Characters.update(character._id, {$set: {gold: character.gold, XP: character.XP}});
      Meteor.call('randomItemReward', character._id, quest.difficulty, function(error, result){} );
    });
  },

  questAttack: function(type) {
    var character = util.currentCharacter();
    var group = Groups.findOne({members: character._id});
    var quest = util.questForCurrentCharacter(type);
    var monster = Monsters.findOne({_id: quest.monsterId});
    var subMonster;
    var characterTotalStrength = character.strength + util.getTotalStatsOfEquippedItems().strength;
    var damage = util.randomRange(characterTotalStrength);
    var monsterUpdate;

    var initialGold = character.gold;

    if(type === "group"){
      if(character.tokens) {
        subMonster = monster.subMonsters[character._id];
        subMonster.health -= damage;
        character.gold += util.randomRange(6);
        character.XP += util.randomRange(6);
        character.tokens--;
        var monsterCurrentHealth = util.sumPropertyOfSubmonsters(monster, 'health');
        if(monsterCurrentHealth <= 0) {
          console.log("the monster is dead");
          Meteor.call('groupReward', character._id, function (error, result) {});
          quest.status = "completed";
        }
      } else {
        //Render error message: You do not have enough tokens!
      }

      monster.subMonsters[character._id] = subMonster;

      monsterUpdate = _.omit(monster, "_id");

    }

    if(type === "solo"){
      if(character.tokens) {
        monster.health -= damage;
        character.tokens--;
        character.gold += util.randomRange(3);
        character.XP += util.randomRange(3);
        if(monster.health <= 0) {
          console.log("Killed solo monster");
          Meteor.call('soloReward', character._id, quest._id, function (error, result) {});
          quest.status = "completed";
        }
      } else {
        //Render error message: You do not have enough tokens!
      }
      monsterUpdate = _.pick(monster, "health");
    }

    var result = Monsters.update(monster._id, {$set: monsterUpdate});
    var questUpdate = _.pick(quest, "status");
    var characterUpdate = _.pick(character, "tokens", "gold", "XP" );
    Quests.update(quest._id, {$set: questUpdate});
    Characters.update(character._id, {$set: characterUpdate});
    Meteor.call('levelUp', function (error, result) {});

    var attackInfo = {
      gold: character.gold - initialGold,
      damage: damage
    };

    return attackInfo;
  },

  questEnd: function() {
    var quest = util.questForCurrentCharacter('solo');
    var monster = Monsters.findOne(quest.monsterId);
    var character = Characters.findOne({userId: user._id});
    var damage = Math.floor(monster.attackDamagePercentage * character.max_health);
    var gameExpired = (moment() > quest.startDate.add(quest.duration, 'd'));

    var characterUpdate = {
      current_health: character.current_health - damage
    };

    var questUpdate = {};
    if (character.current_health - damage < 0 || gameExpired) {
      console.log("You are dead!");
      questUpdate = {
        status: "lost"
      };
      // Create game over over and make they pay to respawn
    }

    Quests.update(quest._id, {$set: questUpdate});
    Characters.update(character._id, {$set: characterUpdate});

  },
  groupQuestVoteInit: function(difficulty) {
    var character = util.currentCharacter();
    var group = Groups.findOne({members: character._id});
    var quest = Quests.findOne({groupId: group._id, difficulty: difficulty, status: "pending"});
    if (quest) {
      console.log("A vote for this quest has already been started.");
    } else {
      Meteor.call('groupQuestInit', difficulty, function (error, result) {});
    }

  },
  groupQuestInit: function(difficulty) {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var group = Groups.findOne({members: character._id});

    var baseReward = 200;

    var memberIdToSubmonster = group.members.reduce(function(memberIdToSubmonster, memberId) {
      memberCharacter = Characters.findOne({_id: memberId});
      memberIdToSubmonster[memberId] = util.createMonster(memberCharacter, difficulty, baseReward);
      return memberIdToSubmonster;
    }, {});

    masterMonsterId = Monsters.insert({subMonsters: memberIdToSubmonster});

    var startDate = moment();

    var questStats = {
      groupId: group._id,
      monsterId: masterMonsterId,
      difficulty: difficulty,
      status: "pending",
      startDate: startDate,
      questDuration: 3,
      accepted: [character._id],
      declined: [],
      voteInitializer: character._id
      // add gold and items here
    };
    var questId = Quests.insert(questStats);
    createVoteNotification(questId);
  },

  groupQuestPause: function() {
    // remove user impact on quest difficulty
  },
  groupQuestVote: function(voteAction, questId) {
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    var quest = Quests.findOne({_id: questId});
    var activeQuests = Quests.find({groupId: group._id, status: "active"}).fetch();
    if (quest.accepted.indexOf(character._id) < 0 && quest.declined.indexOf(character._id) < 0  && activeQuests.length < 1) {
      if(voteAction === "accept") {
        quest.accepted.push(character._id);
      } else {
        quest.declined.push(character._id);
      }
    }
    Quests.update(quest._id, {$set: _.pick(quest, "accepted", "declined")});
    Meteor.call('groupChosenQuest', function(error, result){});
  },
  groupChosenQuest: function() {
    var character = Characters.findOne({userId: Meteor.userId()});
    var group = Groups.findOne({members: character._id});
    var quests = Quests.find({groupId: group._id, status: "pending"}).fetch();
    var rejectedQuests = [];
    quests.forEach(function(quest) {
      var groupAcceptedRatio = quest.accepted.length / group.members.length;
      if ((groupAcceptedRatio > 0.4) || ((moment() > moment(quest.startDate).add(1, 'd') && groupAcceptedRatio > 0.5))) {
        // CHANGE THIS IN A BIT
        quest.status = "active";
        quest.startDate = moment();
        rejectedQuests = _.without(quests, quest);
        Quests.update(quest._id, {$set: {status: quest.status, startDate: quest.startDate}});
      } else if(moment() > moment(quest.startDate).add(1, 'd') && groupAcceptedRatio < 0.5) {
        rejectedQuests.push(quest);
      }
    });
    rejectedQuests.forEach(function(quest){
      console.log("removing: " + quest);
      Monsters.remove({_id: quest.monsterId});
      Quests.remove(quest._id);
    });
    // check for winning conditions of voting
    // if any failures, delete them
    //
  }
});
