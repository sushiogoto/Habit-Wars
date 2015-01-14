Template.characterAttributes.helpers({
  character: function () {
    character = util.currentCharacter();
    character.equippedStrength = util.getTotalStatsOfEquippedItems(character._id).strength;
    character.equippedIntelligence = util.getTotalStatsOfEquippedItems(character._id).intelligence;
    return character;
  }
});

Template.characterAttributes.events({
  'click .add-strength': function () {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    if (character.attributePoints > 0){
      Meteor.call('updateCharacterAttribute', "strength", function (error, result) {});
    }
  },

  'click .add-intelligence': function () {
    user = Meteor.user();
    character = Characters.findOne({userId: user._id});
    if (character.attributePoints > 0){
      Meteor.call('updateCharacterAttribute', "intelligence", function (error, result) {});
    }
  }
});