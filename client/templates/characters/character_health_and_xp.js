Template.characterHealthAndXp.helpers({
  character: function () {
    user = Meteor.user();
    return Characters.findOne({userId: user._id});
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
