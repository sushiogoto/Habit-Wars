Quests = new Mongo.Collection('quests');

Meteor.methods({
  questInit: function(difficulty) {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var quest = Quests.findOne({userId: user._id, status: "active"});

    var baseGold = 100;
    var baseXP = 100;

    var modifier = {
      easy: 0.5,
      medium: 1.0,
      hard: 1.5
    };

    var monsterDamage = {
      easy: 0.15,
      medium: 0.25,
      hard: 0.4
    };

    var randomRange = function(number) {
      return Math.floor(modifier[difficulty] * number * (0.8 + Math.random() * 0.4));
    };

    var monsterHealth = randomRange(character.max_health);

    var monsterStats = {

      health: monsterHealth,
      fullHealth: monsterHealth,
      // strength: randomRange(character.strength), ---> may use later
      difficulty: difficulty,
      attackDamagePercentage: monsterDamage[difficulty]
    };

    var monsterStatsId = Monsters.insert(monsterStats);

    var startDate = moment();

    var questStats = {
      userId: user._id,
      monsterId: monsterStatsId,
      difficulty: difficulty,
      gold: randomRange(baseGold),
      XP: randomRange(baseXP),
      status: "active",
      startDate: startDate,
      questDuration: 1
    };


    if (!quest) {
      var questId = Quests.insert(questStats);
      return "Joined solo quest.";
    } else {
      return "Solo quest already in progress.";
    }
  },

  randomItemReward: function(characterId, difficulty){

    var character = Characters.findOne({_id: characterId});
    var itemTypes = ["head", "chest", "hands", "legs", "feet", "mainHand", "offHand"];

    var randomItemStatsModifier = {
      easy: 0.5 * (0.8 + Math.random() * 0.4),
      medium: 1.0 * (0.8 + Math.random() * 0.4),
      hard: 1.5 * (0.8 + Math.random() * 0.4)
    };

    var randomName = function(type) {
      var adjective = ["Destroyer", "Ice", "Fire", "Poison", "Valyrian Steel", "Desolation", "Sunsoul", "Rage-Blind", "Broken"];
      var noun = {
        head: "Helmet",
        chest: "Armour",
        hands: "Gauntlet",
        legs: "Grieves",
        feet: "Boots",
        mainHand: "Sword",
        offHand: "Shield"
      };
      return noun[type] + " of " + _.sample(adjective);
    };

    var type = _.sample(itemTypes);

    var rewardItem = Items.insert({
      name:          randomName(type),
      type:          type,
      health:        Math.floor(character.max_health * 0.3 * randomItemStatsModifier[difficulty]),
      strength:      Math.floor(character.strength * 0.5 * randomItemStatsModifier[difficulty]),
      intelligence:  Math.floor(character.intelligence * 0.5 * randomItemStatsModifier[difficulty]),
      quantity:      1,
      price:         Math.floor(50 * (0.8 + Math.random() * 0.4)),
      random:        true
    });
    Meteor.call('modifyItem', rewardItem, 'add', character._id, function(error, result){});
  },

  soloReward: function(characterId, questId) {
    var character = Characters.findOne({_id: characterId});
    var quest =  Quests.findOne({_id: questId});
    character.gold      += quest.gold;
    character.currentXP += quest.XP;
    console.log("Im in soloReward");
    Characters.update(character._id, {$set: {gold: character.gold, currentXP: character.currentXP}});
    Meteor.call('randomItemReward', character._id, quest.difficulty, function(error, result){} );
  },

  groupReward: function(characterId){
    var group = Groups.findOne({members: characterId});
    var groupMembers = group.members;
    var quest = Quests.findOne({groupId: group._id});
    var monster = Monsters.findOne({_id: quest.monsterId});
    console.log("Im in groupReward");
    groupMembers.forEach(function (member) {
      var character = Characters.findOne({_id: member});
      character.gold += monster.subMonsters[member].gold;
      character.currentXP += monster.subMonsters[member].XP;
      Characters.update(character._id, {$set: {gold: character.gold, currentXP: character.currentXP}});
      Meteor.call('randomItemReward', character._id, quest.difficulty, function(error, result){} );
    });
  },

  questAttack: function(type) {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var characterId = character._id;
    var group = Groups.findOne({members: character._id});
    var quest = type === "solo" ?  Quests.findOne({userId: user._id, status: "active"}) : Quests.findOne({groupId: group._id, status: "active"});
    var monster = Monsters.findOne({_id: quest.monsterId});
    var subMonster;
    var damage = Math.floor(character.strength * (0.8 + Math.random() * 0.4));
    var monsterUpdate;

    if(type === "group"){
      if(character.tokens) {
        subMonster = monster.subMonsters[character._id];
        subMonster.health -= damage;
        // character.tokens--;
        monster.health = _.pluck(_.values(monster.subMonsters), "health").reduce(function(a, b){
          return a + b;
        }, 0);
        if(monster.health <= 0) {
          console.log("the monster is dead");
          Meteor.call('groupReward', character._id, function (error, result) {});
          quest.status = "completed";
        }
      } else {
        //Render error message: You do not have enough tokens!
      }

      monster.subMonsters[characterId] = subMonster;

      monsterUpdate = _.omit(monster, "_id");

    }

    if(type === "solo"){
      if(character.tokens) {
        monster.health -= damage;
        character.tokens--;
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
    var characterUpdate = _.pick(character, "tokens");
    Quests.update(quest._id, {$set: questUpdate});
    Characters.update(character._id, {$set: characterUpdate});
    Meteor.call('levelUp', function (error, result) {});
  },

  questEnd: function() {
    var user = Meteor.user();
    var quest = Quests.findOne({userId: user._id, status: "active"});
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
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
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

    var modifier = {
      easy: 0.5,
      medium: 1.0,
      hard: 1.5
    };

    var monsterDamage = {
      easy: 0.15,
      medium: 0.25,
      hard: 0.4
    };

    var baseGold = 200;
    var baseXP = 200;

    var randomRange = function(number) {
      return Math.floor(modifier[difficulty] * number * (0.8 + Math.random() * 0.4));
    };

    masterMonsterId = Monsters.insert({ subMonsters: {}});

    var subMonsterHealth = randomRange(character.max_health);

    var memberIdToSubmonster = group.members.reduce(function(memberIdToSubmonster, memberId) {
      memberIdToSubmonster[memberId] = {
        health: subMonsterHealth,
        fullHealth: subMonsterHealth,
        // strength: randomRange(character.strength), ---> may use later
        difficulty: difficulty,
        attackDamagePercentage: monsterDamage[difficulty],
        gold: randomRange(baseGold),
        XP: randomRange(baseXP)
      };
      return memberIdToSubmonster;
    }, {});

    Monsters.update(masterMonsterId, {$set: { subMonsters: memberIdToSubmonster} });

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
      Quests.remove(quest._id);
    });
    // check for winning conditions of voting
    // if any failures, delete them
    //
  }
});