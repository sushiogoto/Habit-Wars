Template.rpgGameCharacter.helpers({
  position: function() {
    var position = Positions.findOne({characterId: this.toString()});
    console.log("left:" + position.posX + ";" + "top:" + position.posY);
    return "left:" + position.posX + "px;" + "top:" + position.posY + "px;";
  }
});