Template.gitEvents.events({
  'click .getgit': function(e) {
    e.preventDefault();
    Meteor.call('updateGitRecord', function (error, result) {
    });
  }
});

console.log("TEST AGAIN")