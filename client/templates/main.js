if (Meteor.isClient) {
  Template.linkTemplate.events({
    'click .link-github': function () {
      Meteor.linkWithGithub();
    },
    'click .link-facebook': function () {
      Meteor.linkWithFacebook();
    },
    'click .getgit': function(e) {
      e.preventDefault();
      Meteor.call('updateGitRecord', function (error, result) {
      });
    }
  });

  Template.linkTemplate.helpers({
    services: function () {
      var user = Meteor.user();
      if (user) {
        return _.keys(user.services);
      } else {
        return;
      }
    }
  });
}