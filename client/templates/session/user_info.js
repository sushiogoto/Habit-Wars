Template.user_loggedout.events({
  'click #login': function(e, tmpl) {
    Meteor.loginWithGithub({
      requestPermissions: ['user', 'public_repo']
    }, function (err) {
      if (err) {
        // error handling
      } else {
        // show an alert
      }
    });
  }
});

Template.user_loggedin.events({
  'click #logout': function (e, tmpl) {
    Meteor.logout(function (err) {
      if (err) {
        // show err message
      } else {
        // show an alert that says logged out
      }
    });
  }
});