Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', {
  name: 'linkTemplate'
});

Router.route('/character', {
  name: 'characterIndex'
});
