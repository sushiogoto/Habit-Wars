Characters = new Mongo.Collection('characters');

Characters.allow({
  update: function(userId, doc) {
    // only allow posting if you are logged in
    return !! userId;
  }
});

Meteor.methods({
  characterCreate: function(characterAttributes, habitAttributes) {

    check(characterAttributes, {
      name: String,
      avatarUrl: String
    });
    // update the habitAttributes check later on to check the individual habits inside for numbers,
    // otherwise it's not very secure to just check for an object.
    check(habitAttributes, {
      targets: Object
    });

    var character = _.extend(characterAttributes, {
      userId: Meteor.userId(),
      attributePoints: 0,
      max_health: 100,
      current_health: 100,
      strength: 10,
      intelligence: 10,

      XP: 0,
      nextLevelXP: 100,
      level: 1,
      tokens: 5,
      gold: 0
    });

    var habit = _.extend(habitAttributes, {
      userId: Meteor.userId(),
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, //moment(user.createdAt).format('x'),
      git_record: {},
    });

    var characterId = Characters.insert(character);
    var habitId = Habits.insert(habit);

    var itemsGrid = [0, 0, 0, 0, 0].map(function(inner) {
      return [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    });
    Inventories.insert({
      characterId: characterId,
      items: [],
      itemsGrid: itemsGrid
    });
  },

  updateCharacterAttribute: function(attribute) {
    var character = util.currentCharacter();
    if (attribute === "strength") {
      newStrength = character.strength + 1;
      newAttributePoints = character.attributePoints - 1;
      updateObj = {
        strength: newStrength,
        attributePoints: newAttributePoints
      };

      Characters.update(character._id, {$set: updateObj});
    } else if (attribute === "intelligence") {
      newIntelligence = character.intelligence + 1;
      newAttributePoints = character.attributePoints - 1;

      updateObj = {
        intelligence: newIntelligence,
        attributePoints: newAttributePoints
      };

      Characters.update(character._id, {$set: updateObj});
    }
  },

  levelUp: function() {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    while(character.XP >= character.nextLevelXP) {

      var characterAttributes = {
        level: character.level += 1,
        XP: Math.floor(character.XP -= character.nextLevelXP),
        nextLevelXP: Math.floor(character.nextLevelXP *= 1.2),
        max_health: character.max_health += Math.floor(20 * (1 + character.level/10)),
        current_health: character.current_health = character.max_health,
        strength: character.strength += 1,
        intelligence: character.intelligence += 1,
        attributePoints: character.attributePoints += 2
      };

      Characters.update(character._id, {$set: characterAttributes});
    }


  }
});
