Template.registerHelper("currentUser", function() {
  var user = Meteor.user();
  return user;
}) ;