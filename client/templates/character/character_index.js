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

    Meteor.call('setGetTarget', target, function(error, result) {
      // display the error to the user and abort
      if (error)
        return throwError(error.reason);
    });

  }
});

Template.characterIndex.helpers({
  commits: function() {
    habits = Habits.findOne({userId: Meteor.user()._id});
    git_array = _.map(habits.git_record, function(commits, key) {
      return key + ": " + commits;
    });
    // date = new Date();
    // year = date.getUTCFullYear();
    // month = date.getUTCMonth() + 1;
    // day = date.getUTCDate();
    // timeNow = year + "-" + month + "-" + day;
    // for(var i = 0; i < git.git_record.length; i++) {

    // }
    return git_array;
  }
});