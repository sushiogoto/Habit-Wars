Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {
  name: 'characterIndex'
});

Router.route('/create', {
  name: 'characterCreate',
  onBeforeAction: function() {
    if(Characters.findOne({userId: Meteor.userId()})) {
      this.render('characterIndex');
    }
  }
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
    this.render('landingPage');
    }
  } else if (!Characters.findOne({userId: Meteor.userId()})) {
    this.render('characterCreate');
  } else {
    this.next();
  }
};


Router.onBeforeAction(requireLogin);