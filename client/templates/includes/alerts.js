Template.alerts.helpers({
  alerts: function() {
    return Alerts.find();
  }
});

Template.alerts.rendered = function() {
  var alert = this.data;
  Meteor.setTimeout(function() {
    Alerts.remove(alert._id);
  }, 3000);
};