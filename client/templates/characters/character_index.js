Template.characterIndex.events({
  'click .getgit': function(e) {
    e.preventDefault();
    Meteor.call('updateGitRecord', function(error, result) {
      if (error) {
         throwError(error.reason);
       }
    });
    Meteor.call('levelUp', function(error, result) {});
  },
  'submit form': function(e) {
    e.preventDefault();

    var target = $(e.target).find('[name=target]').val();

    Meteor.call('setGitTarget', target, function(error, result) {
      // display the error to the user and abort
      if (error)
        return throwError(error.reason);
    });

  }
});

Template.characterIndex.helpers({
  commits: function() {
    user = Meteor.user();
    habits = Habits.findOne({userId: user._id});
    git_array = _.map(habits.git_record, function(commits, key) {
      return key + ": " + commits[0];
    });
    return git_array;
  }
});