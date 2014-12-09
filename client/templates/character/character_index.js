Template.characterIndex.events({
  'click .getgit': function(e) {
    e.preventDefault();
    Meteor.call('updateGitRecord', function(error, result) {
      if (error) {
         throwError(error.reason);
       }
    });
  }
});

Template.characterIndex.helpers({
  commits: function() {
    git = GitRecords.findOne({userId: Meteor.user()._id});
    git_array = _.map(git.git_record, function(commits, key) {
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