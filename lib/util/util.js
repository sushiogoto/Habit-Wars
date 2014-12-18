util = {};

util.randomRange = function(number) {
  return Math.floor(number * (0.8 + Math.random() * 0.4));
};

util.randomRangeForDifficulty = function(difficulty, number) {
  return config.difficultyModifier[difficulty] * util.randomRange(number);
};

util.createMonster = function(character, difficulty, baseReward) {
  var monsterHealth = util.randomRangeForDifficulty(difficulty, character.max_health);

  return {
    health: monsterHealth,
    fullHealth: monsterHealth,
    // strength: util.randomRangeForDifficulty(difficulty, character.strength), ---> may use later
    difficulty: difficulty,
    attackDamagePercentage: config.monsterDamage[difficulty],
    gold: util.randomRangeForDifficulty(difficulty, baseReward),
    XP: util.randomRangeForDifficulty(difficulty, baseReward)
  };
};

util.questTimeRemaining = function(quest) {
    var time_left = moment(quest.startDate).add(quest.questDuration, 'd') - moment();
    var hours = Math.floor(time_left / (1000 * 60 * 60));
    var minutes = Math.floor((time_left - (hours * (1000 * 60 * 60))) / (1000 * 60));
    var seconds = Math.floor((time_left - (hours * (1000 * 60 * 60)) - (minutes * 1000 * 60)) / 1000);
    return hours + " hrs " + minutes + " min " + seconds + " sec";
};

util.currentCharacter = function() {
  return Characters.findOne({userId: Meteor.userId()});
};

util.questForCurrentCharacter = function(type) {
  if (type === 'solo') {
    return Quests.findOne({
      characterId: util.currentCharacter()._id,
      status: "active"
    });
  } else if (type === 'group') {
    var group = Groups.findOne({members: util.currentCharacter()._id});
    if (group) {
      return Quests.findOne({
        groupId: group._id,
        status: "active"
      });
    } else {
      return null;
    }
  } else {
    throw "Unknown quest type";
  }
};

util.monsterForCurrentCharacter = function(questType) {
  return Monsters.findOne({_id: util.questForCurrentCharacter(questType).monsterId});
};

util.sumPropertyOfSubmonsters = function(monster, property) {
  return _.pluck(_.values(monster.subMonsters), property).reduce(function(a, b){
    return a + b;
  }, 0);
};

util.shareOfGroupReward = function(monster, rewardType) {
  return util.sumPropertyOfSubmonsters(monster, rewardType) / _.size(monster.subMonsters);
};

util.getTotalStatsOfEquippedItems = function(characterId) {
  var character = Characters.findOne({_id: characterId});
  var inventory = Inventories.findOne({characterId: character._id});
  var equippedItems = _.filter(inventory.items, function(item){
    return item.equipped;
  });
  return {
    health: _.pluck(equippedItems, "health").reduce(function(a, b){
      return a + b;
    }, 0),
    strength: _.pluck(equippedItems, "strength").reduce(function(a, b){
      return a + b;
    }, 0),
    intelligence: _.pluck(equippedItems, "intelligence").reduce(function(a, b){
      return a + b;
    }, 0),
  };

};