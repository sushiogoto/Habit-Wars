Template.rpgGameCharacter.helpers({
  position: function() {
    var position = Positions.findOne({characterId: this.toString()});
    console.log(position.stepType);
    return "left:" + position.posX + "px;" + "top:" + position.posY + "px;";
  },
  stepType: function() {
    var position = Positions.findOne({characterId: this.toString()});
    return position.stepType;
  },
  characterClass: function() {
    var character = Characters.findOne({_id: this.toString()});
    return character.characterClass;
  }
});