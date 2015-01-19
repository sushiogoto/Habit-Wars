Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {return [Meteor.subscribe('characters'), Meteor.subscribe('positions'),
                              Meteor.subscribe('inventories'), Meteor.subscribe('habits'),
                              Meteor.subscribe('messages'),
                              Meteor.subscribe('notifications'),
                              Meteor.subscribe('userData')];}
});

Router.route('/', {
  name: 'characterIndex',
  waitOn: function() {
    return [Meteor.subscribe('items')];
  }
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
  name: 'questsIndex',
  waitOn: function() {
    return [Meteor.subscribe('monsters'), Meteor.subscribe('quests'), Meteor.subscribe('groups'), Meteor.subscribe('positions'),];
  }
});

Router.route('/welcome', {
  name: 'landingPage'
});

Router.route('/game', {
  name: 'questGame'
});

// var requireLogin = function() {
//   if (!Meteor.user()) {
//     if (Meteor.loggingIn()) {
//       this.render(this.loadingTemplate);
//     } else {
//     this.render('landingPage');
//     }
//   } else {
//     this.next();
//   }
// };

var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
    this.render('landingPage');
    }
  } else if (Characters.find({userId: Meteor.userId()}).count() === 0) {
    this.render('characterCreate');
  } else {
    this.next();
  }
};


Router.onBeforeAction(requireLogin);