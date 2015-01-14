// var currentCharacter = function() {
//   return Characters.findOne({userId: Meteor.userId()});
// };

Meteor.publish('characters', function() {
  return Characters.find();
});

Meteor.publish('inventories', function() {
  return Inventories.find();
});

Meteor.publish('groups', function() {
  return Groups.find();
});

Meteor.publish('items', function() {
  return Items.find();
});

Meteor.publish('habits', function() {
  return Habits.find();
});

Meteor.publish('monsters', function() {
  return Monsters.find();
});

Meteor.publish('quests', function() {
  return Quests.find();
});

Meteor.publish('messages', function() {
  return Messages.find();
});

Meteor.publish('notifications', function() {
  return Notifications.find();
});