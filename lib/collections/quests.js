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

    var monsterStats = {
      health: randomRange(character.max_health),
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
    character = Characters.findOne({_id: characterId});
    quest =  Quests.findOne({_id: questId});
    character.gold      += quest.gold;
    character.currentXP += quest.XP;
    Meteor.call('randomItemReward', character._id, quest.difficulty, function(error, result){} );
  },

  groupReward: function(characterId){
    quest = Quests.findOne({members: characterId});
    quest.members.forEach(function (member) {
      Meteor.call('soloReward', member, quest._id, function(error, result){});
    });
  },

  questAttack: function() {
    var user = Meteor.user();
    var quest = Quests.findOne({userId: user._id, status: "active"});
    var monster = Monsters.findOne({_id: quest.monsterId});
    var character = Characters.findOne({userId: user._id});
    var damage = character.strength * (0.8 + Math.random() * 0.4);

    if(character.tokens) {
      monster.health -= damage;
      character.tokens--;
      if(monster.health <= 0) {
        Meteor.call('soloReward', character._id, quest._id, function (error, result) {});
        quest.status = "completed";
      }
    } else {
      //Render error message: You do not have enough tokens!
    }

    var monsterUpdate = _.pick(monster, "health");
    var questUpdate = _.pick(quest, "status");
    var characterUpdate = _.pick(character, "gold", "currentXP", "tokens");
    var result = Monsters.update(monster._id, {$set: monsterUpdate});
    Quests.update(quest._id, {$set: questUpdate});
    Characters.update(character._id, {$set: characterUpdate});
    Meteor.call('levelUp', function (error, result) {});
  },

  questEnd: function() {
    var user = Meteor.user();
    var quest = Quests.findOne({userId: user._id, status: "active"});
    var monster = Monsters.findOne(quest.monsterId);
    var character = Characters.findOne({userId: user._id});
    var damage = monster.attackDamagePercentage * character.max_health;
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
    var group = Groups.find({members: character._id});
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

    var baseGold = 100;
    var baseXP = 100;

    var randomRange = function(number) {
      return Math.floor(modifier[difficulty] * number * (0.8 + Math.random() * 0.4));
    };

    masterMonsterId = Monsters.insert({ subMonsters: {}});

    var memberIdToSubmonster = group.members.reduce(function(memberIdToSubmonster, memberId) {
      memberIdToSubmonster[memberId] = {
        health: randomRange(character.max_health),
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
      questDuration: 3
      // add gold and items here
    };
    var questId = Quests.insert(questStats);
  },

  groupQuestPause: function() {
    // remove user impact on quest difficulty
  }
});