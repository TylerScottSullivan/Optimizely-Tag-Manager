var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
  projectId: String,
  accountId: String,
  // tags: Array, //of objects of the tags
  trackingID: String,
  trackingTrigger: String
})


module.exports = mongoose.model('Project', projectSchema);
