Groups = new Mongo.Collection('groups');

Meteor.methods({

  createGroup: function(type, intensity){
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var habit = Habits.findOne({userId: user._id});
    console.log("clicked craeate");

    // Verify type
    Groups.insert({
      name: "Placeholder Group Name",
      type: type,
      members: [character._id],
      target: habit.targets[type],
      intensity: intensity
    });
  },

  joinGroup: function(type, intensity) {
    var user = Meteor.user();
    var character = Characters.findOne({userId: user._id});
    var groupsOfSelectedType = Groups.find({type: type}).fetch();
    console.log(type);

    var userTarget = Habits.findOne({userId: user._id}).targets[type];
    var targetRange = _.range(0.4, 0, -0.1);

    // To optimise later on:
    // Go through all the groups' targets and calculate % deviation from user target
    var chosenGroup;
    // cycle through potential groups that match user target
    targetRange.forEach(function(delta) {
      // cycle through potential target range deviation from user target
      var matchingGroup = _.find(groupsOfSelectedType, function(group) {
        return (userTarget * (1 - delta)) <= group.target && group.target <= Math.floor(userTarget * (1 + delta)) && group.members.length < 5 && group.intensity == intensity;
      });
      if (matchingGroup) {
        chosenGroup = matchingGroup;
      }
    });

    if (chosenGroup === undefined) {
      console.log("No group found - creating group");
      Meteor.call('createGroup', type, intensity, function (error, result) {});
    } else {
      Groups.update(chosenGroup._id, {$addToSet: {members: character._id}});
    }
  },

  groupDamage: function() {

  }
});

// different gifs/ images for different actions inside the character image object

// user can choose intensity of group (intense, normal etc)

// leave group now for 5 tokens or leave 3 (length of one grup quest) days from now

// pause quest should show message saying you cannot rejoin the quest

// group chat

// kick member vote

// anyone can initiate a quest, 1 day to respond and an email saying to accept or decline

// quest starts based on majority. Any number of quests can be initiated, majority in 24hrs or first to get everyone on board starts immediately