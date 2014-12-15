Notifications = new Mongo.Collection('notifications');

createVoteNotification = function(questId) {
  var quest = Quests.findOne(questId);
  var group = Groups.findOne(quest.groupId);

  group.members.forEach(function(member) {
    userId = Characters.findOne({_id: member}).userId;

    if (member !== quest.voteInitializer) {
      Notifications.insert({
        userId: userId,
        characterId: member,
        questId: quest._id,
        read: false,
        voteInitializer: quest.voteInitializer
      });
    }
  });
};