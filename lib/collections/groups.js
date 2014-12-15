Groups = new Mongo.Collection('groups');

Meteor.methods({

  createGroup: function(type){
    var user = Meteor.user();
    var habit = Habits.findOne({userId: user._id});
    console.log("clicked craeate");

    // Verify type
    Groups.insert({
      name: "Placeholder Group Name",
      type: type,
      members: [user._id],
      target: habit.targets[type]
    });
  },

  joinGroup: function(type) {
    var user = Meteor.user();
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
        return (userTarget * (1 - delta)) <= group.target && group.target <= Math.floor(userTarget * (1 + delta)) && group.members.length < 5 ;
      });
      if (matchingGroup) {
        chosenGroup = matchingGroup;
      }
    });

    if (chosenGroup === undefined) {
      console.log("No group found - creating group");
      Meteor.call('createGroup', type, function (error, result) {});
    } else {
      Groups.update(chosenGroup._id, {$addToSet: {members: user._id}});
    }
  }
});