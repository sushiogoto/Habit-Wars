Habits = new Mongo.Collection('habits');

Meteor.methods({
  updateGitRecord: function() {
    var user = Meteor.user();
    var username = user.services.github.username;
    var client_id = "745428022e3cfb98483d";
    var client_secret = "5d95ae63ace4e66256e8965126043a04ba2b00f5";

    if (Habits.findOne({userId: user._id}) === undefined){
      Habits.insert({
        userId: user._id,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, //moment(user.createdAt).format('x'),
        git_record: {}
      });
    }

    return $.ajax({
      dataType: "jsonp",
      url: "https://api.github.com/users/" + username + "/events?page=1&per_page=100&client_id=" + client_id + "&client_secret=" + client_secret
    }).done(function(events) {
      var activities = events.data;
      var record = Habits.findOne({userId: user._id});

      for (var i = 0; i < activities.length; i++) {
        var commit = activities[i];
        var commitTime = moment(commit.created_at, "YYYY-MM-DDTHH:mm:ssZ").format('x');
        var commitTimeInJS = moment(commit.created_at, "YYYY-MM-DDTHH:mm:ssZ").toDate();

        if (commitTime > record.timestamp && commit.type === "PushEvent") {
          year = commitTimeInJS.getUTCFullYear();
          month = commitTimeInJS.getUTCMonth() + 1;
          day = commitTimeInJS.getUTCDate();
          date = year + "-" + month + "-" + day;

          if (record.git_record[date] === undefined) {
            record.git_record[date] = 1;
          } else {
            record.git_record[date] += commit.payload.size;
          }

        }
      }
      record.timestamp = Date.now();
      updates = _.pick(record,
        "timestamp",
        "git_record"
        );

      return Habits.update(record._id, {$set: updates});

    });
  }
});