Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'linkTemplate'
});

Router.route('/character', {
  name: 'characterIndex'
});

var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      console.log('blub');
    } else {
      console.log('someshit');
    }
  } else {
    console.log("meteor is confusing");
    Meteor.call('updateGitRecord', function (error, result) {
    });
    this.next();
  }
};

Router.onBeforeAction(requireLogin, {only: 'characterIndex'});
