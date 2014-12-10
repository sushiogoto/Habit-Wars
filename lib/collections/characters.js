Characters = new Mongo.Collection('characters');

Meteor.methods({
  levelUp: function() {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    while(character.currentXP > character.nextLevelXP) {

      var characterAttributes = {
        level: character.level += 1,
        currentXP: character.currentXP -= character.nextLevelXP,
        nextLevelXP: Math.floor(character.nextLevelXP *= 1.2),
        max_health: character.max_health += Math.floor(20 * (1 + character.level/10)),
        current_health: character.current_health = character.max_health,
        strength: character.strength += 1,
        intelligence: character.intelligence += 1
      };

      Characters.update(character._id, {$set: characterAttributes});
    }


  }
});