Template.groupsIndex.events({
  'click .createGroup': function() {
    Meteor.call('createGroup', "git_commit_target", function (error, result) {});
  },
  'click .joinGroup': function() {
    Meteor.call('joinGroup', "git_commit_target", function (error, result) {});
  }
});