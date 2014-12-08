GitRecords = new Mongo.Collection('git_records');

Meteor.methods({
  updateGitRecord: function() {
    var user = Meteor.user();
    var username = user.services.github.username;
    var client_id = "745428022e3cfb98483d";
    var client_secret = "5d95ae63ace4e66256e8965126043a04ba2b00f5";

    if (GitRecords.findOne({userId: user._id}) === undefined){
      GitRecords.insert({
        userId: user._id,
        timestamp: moment(user.createdAt, "YYYY-MM-DDTHH:mm:ssZ").toDate(),
        git_record: {}
      });
    }

    return $.ajax({
      dataType: "jsonp",
      url: "https://api.github.com/users/" + username + "/events?page=1&per_page=100&client_id=" + client_id + "&client_secret=" + client_secret
    }).done(function(events) {
      var activities = events.data;
      var record = GitRecords.findOne({userId: user._id});

      for (var i = 0; i < activities.length; i++) {
        var commit = activities[i];
        var commitTime = moment(commit.created_at, "YYYY-MM-DDTHH:mm:ssZ").toDate();

        if (commitTime > record.timestamp && commit.type === "PushEvent") {
          year = commitTime.getUTCFullYear();
          month = commitTime.getUTCMonth() + 1;
          day = commitTime.getUTCDate();
          date = year + "-" + month + "-" + day;

          if (record.git_record[date] === undefined) {
            record.git_record[date] = 1;
          } else {
            record.git_record[date] += commit.payload.size;
          }

        }
      }
      console.log("MATAFACKIN LOOP");
      record.timestamp = Date.now();
      updates = _.pick(record,
        "timestamp",
        "git_record"
        );

      return GitRecords.update(record._id, {$set: updates});

    });
  }
});