Template.characterHealthAndXp.helpers({
  character: function () {
    character = util.currentCharacter();
    character.equippedHealth = util.getTotalStatsOfEquippedItems(character._id).health;
    character.current_health += character.equippedHealth;
    character.totalHealth = character.max_health + character.equippedHealth;
    character.healthPercentage = Math.floor( (character.current_health + character.equippedHealth) / character.totalHealth * 100);
    return character;
  },

  health_percentage: function() {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    current_health = character.current_health;
    max_health = character.max_health;
    return Math.floor( current_health / max_health * 100);
  },

  XP_percentage: function() {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    XP = character.XP;
    nextLevelXP = character.nextLevelXP;
    return Math.floor( XP / nextLevelXP * 100);
  }
});
