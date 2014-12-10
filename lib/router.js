Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'characterIndex'
});

Router.route('/profile', {
  name: 'profilePage'
});

var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
    this.render('accessDenied');
    }
  } else {
    this.next();
  }
};

Router.onBeforeAction(requireLogin, {only: ['profilePage', 'characterIndex']});