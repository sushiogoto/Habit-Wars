Template.characterCreate.events({
  'mouseover .one': function(event) {
    Session.set('currentCharacter', 'megaman');
    Session.set('currentCharacterAvatar', "http://www.gearfuse.com/wp-content/uploads/2010/06/retro-gaming-3d-3.gif");
    // change this when have time
  },
  'mouseover .two': function(event) {
    Session.set('currentCharacter', 'aero');
    Session.set('currentCharacterAvatar', "http://ranger.gamebanana.com/img/ico/sprays/zero_run_ekah_render.gif");
  },
  'submit form': function(event) {
    event.preventDefault();
    var avatarUrl = Session.get('currentCharacterAvatar');
    var characterProperties = {
      name: $(event.target).find('[name=characterName]').val(),
      userId: Meteor.userId(),
      avatar_url: avatarUrl,
      attributePoints: 0,
      max_health: 100,
      current_health: 100,
      strength: 10,
      intelligence: 10,

      currentXP: 0,
      nextLevelXP: 100,
      level: 1,
      tokens: 5,
      gold: 0
    };
    var habitProperties = {
      userId: Meteor.userId(),
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, //moment(user.createdAt).format('x'),
      git_record: {},
      targets: {git_commit_target: $(event.target).find('[name=commitTarget]').val()}
    };

    var characterId = Characters.insert(characterProperties);
    var habitId = Habits.insert(habitProperties);

    var itemsGrid = [0, 0, 0, 0, 0].map(function(inner) {
      return [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    });
    Inventories.insert({
      characterId: characterId,
      items: [],
      itemsGrid: itemsGrid
    });
  }
});

Template.characterInfo.helpers({
  characterInfo: function() {
    var currentCharacter = Session.get('currentCharacter');
    // var characterAttributes = {
    //   megaman: {
    //     name: "Megaman",
    //     avatar_url: "http://www.gearfuse.com/wp-content/uploads/2010/06/retro-gaming-3d-3.gif",
    //     attributePoints: 0,
    //     max_health: 100,
    //     current_health: 100,
    //     strength: 10,
    //     intelligence: 10,
    //   }
    // };
    // console.log(currentCharacter);
    // console.log(characterAttributes.currentCharacter);
    return currentCharacter;
  }
});

Template.characterInfo.events({
  'click .select': function() {
    var chosenCharacter = Session.get('currentCharacter');
    Session.set('chosenCharacter', chosenCharacter);
  }
});