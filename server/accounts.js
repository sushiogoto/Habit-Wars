// Accounts.onCreateUser(function (options, user) {
//   var accessToken = user.services.github.accessToken,
//     result,
//     profile;

//   result = Meteor.http.get("https://api.github.com/user", {
//     params: {
//       access_token: accessToken
//     },
//     headers: {"User-Agent": "Meteor/1.0"}
//   });

//   if (result.error)
//     throw result.error;

//   profile = _.pick(result.data,
//     "login",
//     "name",
//     "avatar_url",
//     "url",
//     "company",
//     "blog",
//     "location",
//     "email",
//     "bio",
//     "html_url");

//   user.profile = profile;

//   Characters.insert({
//     userId: user._id,
//     name: "Megaman",
//     avatar_url: "http://www.gearfuse.com/wp-content/uploads/2010/06/retro-gaming-3d-3.gif",
//     health: 100,
//     strength: 10,
//     intelligence: 10,
//     dexterity: 10
//   });

//   return user;
// });