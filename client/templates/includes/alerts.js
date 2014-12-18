Template.alertsMain.helpers({
  alerts: function() {
    return Alerts.find();
  }
});



Template.alertSecond.helpers = {
  message: function() {
    Meteor.setTimeout(function() {
      Alerts.remove(alert._id);
    }, 3000);
    return this.data.message;
  }
};