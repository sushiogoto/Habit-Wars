Template.characterAttributes.helpers({
  character: function () {
    character = util.currentCharacter();
    character.equippedStrength = util.getTotalStatsOfEquippedItems().strength;
    character.equippedIntelligence = util.getTotalStatsOfEquippedItems().intelligence;
    return character;
  }
});

Template.characterAttributes.events({
  'click .add-strength': function () {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    if (character.attributePoints > 0){
      new_strength = character.strength + 1;
      new_attribute_points = character.attributePoints - 1;
      updateObj = {
        strength: new_strength,
        attributePoints: new_attribute_points
      };

      Characters.update(character._id, {$set: updateObj});
    }

  },

  'click .add-intelligence': function () {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    if (character.attributePoints > 0){
      new_intelligence = character.intelligence + 1;
      new_attribute_points = character.attributePoints - 1;

      updateObj = {
        intelligence: new_intelligence,
        attributePoints: new_attribute_points
      };

      Characters.update(character._id, {$set: updateObj});
    }
  }
});