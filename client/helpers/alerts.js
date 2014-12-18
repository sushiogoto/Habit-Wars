// Local (client-only) collection
Alerts = new Mongo.Collection(null);

throwAlert = function(message) {
  Alerts.insert({message: message});
};