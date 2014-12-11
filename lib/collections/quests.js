Quests = new Mongo.Collection('quests');

Meteor.methods({
  questInit: function(difficulty) {
    var modifier = {
      easy: 0.5,
      medium: 1.0,
      hard: 1.5
    };

    var baseGold = 100;

    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});

    var randomRange = function(number) {
      return modifier[difficulty] * number * (0.8 + Math.random() * 0.4);
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
      active: true
      // add gold and items here
    };
    var questId = Quests.insert(questStats);
  }
});