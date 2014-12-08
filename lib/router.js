Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'linkTemplate'
});

var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
    this.render('accessDenied');
    }
  } else {
    Meteor.call('updateGitRecord', function (error, result) {
    });
    this.next();
  }
};

Router.onBeforeAction(requireLogin, {only: 'linkTemplate'});
