Template.groupChat.helpers({
  messages: function() {
    var messages = Messages.find({}, { sort: { time: -1}}).fetch();
    messages.forEach(function(message){
      message.prettyTime = moment(message.time).fromNow();
    });
    return messages;
  }
});

Template.groupChat.events = {
  'keydown input#message' : function(event) {
    if (event.which == 13) {
      if (Meteor.user()) {
        name = Meteor.user().profile.login;
      }
      else {
        name = 'Anonymous';
      }
      var message = document.getElementById('message');

      if (message.value !== '') {
        Messages.insert({
          name: name,
          message: message.value,
          time: new Date()
        });

        document.getElementById('message').value = '';
        message.value = '';
      }
    }
  }
};