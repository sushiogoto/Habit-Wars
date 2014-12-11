Quests = new Mongo.Collection('quests');

Meteor.methods({
  questInit: function(difficulty) {
    var modifier = {
      easy: 0.5,
      medium: 1.0,
      hard: 1.5
    };

    var baseGold = 100;
    var baseXP = 100;

    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});

    var randomRange = function(number) {
      return Math.floor(modifier[difficulty] * number * (0.8 + Math.random() * 0.4));
    };

    var monsterStats = {
      health: randomRange(character.max_health),
      strength: randomRange(character.strength),
      difficulty: difficulty
    };

    var monsterStatsId = Monsters.insert(monsterStats);

    var questStats = {
      userId: user._id,
      monsterId: monsterStatsId,
      difficulty: difficulty,
      gold: randomRange(baseGold),
      XP: randomRange(baseXP),
      active: true
      // add gold and items here
    };
    var questId = Quests.insert(questStats);
  },
  questAttack: function() {
    var user = Meteor.user();
    var quest = Quests.findOne({userId: user._id, active: true});
    var monster = Monsters.findOne(quest.monsterId);
    var character = Characters.findOne({userId: user._id});
    var damage = character.strength * (0.8 + Math.random() * 0.4);

    var reward = function() {
      character.gold += quest.gold;
      character.current_XP += quest.XP;
      // ADD GEAR
    };

    if(character.tokens) {
      monster.health -= damage;
      character.tokens--;
      if(monster.health <= 0) {
        reward();
        quest.active = false;
      }
    } else {
    }

    var monsterUpdate = _.pick(monster, "health");
    console.log(monsterUpdate);
    var questUpdate = _.pick(quest, "active");
    var characterUpdate = _.pick(character, "gold", "current_XP", "tokens");
    console.log(monster._id);
    var result = Monsters.update(monster._id, {$set: monsterUpdate});
    console.log('result: ' + result);
    Quests.update(quest._id, {$set: questUpdate});
    Characters.update(character._id, {$set: characterUpdate});
  }
});