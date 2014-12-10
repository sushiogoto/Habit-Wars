Template.profilePage.rendered = function () {
    var user = Meteor.user();
    choices = ["github", "facebook"];
    if (user) {
      linked = _.keys(user.services).join(', ');
      // unlinked = _.without(choices, linked.join(','));

      for(var i = 0; i < choices.length; i++) {
        if(!linked.indexOf(choices[i])) {
          $('.link-' + choices[i]).attr( "disabled", "disabled");
        }
      }
    } else {
      return;
    }
  };

Template.profilePage.events({
  'click .link-github': function () {
    Meteor.linkWithGithub();
  },
  'click .link-facebook': function () {
    Meteor.linkWithFacebook();
  },
  'submit form': function(e) {
    e.preventDefault();

    var currentUserId = Meteor.user()._id;

    var profileProperties = {
      name: $(e.target).find('[name=name]').val(),
      login: $(e.target).find('[name=login]').val()
    };

    Meteor.users.update(currentUserId, {$set: {profile: profileProperties}},
      function(error) {
        if (error) {
          throwError(error.reason);
        }
      });
  }
});