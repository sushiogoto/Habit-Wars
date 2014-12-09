Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'characterIndex'
});

Router.route('/profile', {
  name: 'profilePage'
});