Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {
  name: 'landingPage'
});

Router.route('/character', {
  name: 'characterIndex'
});

Router.route('/create', {
  name: 'characterCreate'
});

Router.route('/profile', {
  name: 'profilePage'
});

Router.route('/quests', {
  name: 'questsIndex'
});


var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
    this.render('accessDenied');
    }
  } else if (!Characters.findOne({userId: Meteor.userId()})) {
    this.render('characterCreate');
  } else {
    this.next();
  }
};


Router.onBeforeAction(requireLogin);