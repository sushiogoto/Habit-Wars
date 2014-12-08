// Set up login services
Meteor.startup(function() {

  // Remove configuration entries in case service is already configured
  ServiceConfiguration.configurations.remove({
    $or: [{
      service: "facebook"
    }, {
      service: "github"
    }]
  });

  // Add Facebook configuration entry
  ServiceConfiguration.configurations.insert({
    "service": "facebook",
    "appId": "833737010003369",
    "secret": "5ae86e2d59f7277cba7ca6730951e230"
  });

  // Add GitHub configuration entry
  ServiceConfiguration.configurations.insert({
    "service": "github",
    "clientId": "745428022e3cfb98483d",
    "secret": "5d95ae63ace4e66256e8965126043a04ba2b00f5"
  });

  // // Add Google configuration entry
  // ServiceConfiguration.configurations.insert({
  //   "service": "google",
  //   "clientId": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  //   "client_email": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  //   "secret": "XXXXXXXXXXXXXXXXXXXXXXXX"
  // });

  // // Add Facebook configuration entry
  // ServiceConfiguration.configurations.insert({
  //   "service": "linkedin",
  //   "clientId": "XXXXXXXXXXXXXX",
  //   "secret": "XXXXXXXXXXXXXXXX"
  // });
});

Accounts.onCreateUser(function (options, user) {
  if (options && options.profile) {
          user.profile = options.profile;
  }

  if (user.services) {

      var service = _.pairs(user.services)[0];
      console.log(service);
      var serviceName = service[0];
      var serviceData = service[1];

      console.log("serviceName", serviceName);

      if (serviceName == "facebook") {
          user.services.facebook.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
          user.emails = [
              {"address": serviceData.email, "verified": true}
          ];
          console.log(serviceData.id);
          user.profile = {"first_name": serviceData.first_name, "last_name": serviceData.last_name, "avatar": user.services.facebook.picture};
      }
      else if (serviceName == "github") {
          var accessToken = user.services.github.accessToken,
            result,
            profile;

          result = Meteor.http.get("https://api.github.com/user", {
            params: {
              access_token: accessToken
            },
            headers: {"User-Agent": "Meteor/1.0"}
          });

          if (result.error)
            throw result.error;

          profile = _.pick(result.data,
            "login",
            "name",
            "url",
            "company",
            "blog",
            "location",
            "email",
            "bio",
            "html_url");

          user.profile = profile;
          user.profile.avatar = result.data.avatar_url;
          user.emails = [
              {"address": serviceData.email, "verified": true}
          ];
      }

  }
  console.log("user created :", user);

  Characters.insert({
    userId: user._id,
    name: "Megaman",
    avatar_url: "http://www.gearfuse.com/wp-content/uploads/2010/06/retro-gaming-3d-3.gif",
    health: 100,
    strength: 10,
    intelligence: 10,
    dexterity: 10
  });

  return user;




  // return user;
});