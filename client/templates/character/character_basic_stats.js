Template.characterBasicStats.helpers({
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
    currentXP = character.currentXP;
    nextLevelXP = character.nextLevelXP;
    return Math.floor( currentXP / nextLevelXP * 100);
  }
});

Template.characterBasicStats.events({
  'click .add-strength': function () {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    new_strength = character.strength + 1;
    new_attribute_points = character.attributePoints - 1;

    updateObj = {
      strength: new_strength,
      attributePoints: new_attribute_points
    };

    Characters.update(character._id, {$set: updateObj});
  },

  'click .add-intelligence': function () {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    new_intelligence = character.intelligence + 1;
    new_attribute_points = character.attributePoints - 1;

    updateObj = {
      intelligence: new_intelligence,
      attributePoints: new_attribute_points
    };

    Characters.update(character._id, {$set: updateObj});
  }
});