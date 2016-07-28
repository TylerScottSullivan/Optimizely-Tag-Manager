var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')

var projectSchema = mongoose.Schema({
  projectId: String,
  accountId: String,
  tag: String,
  trackingID: String,
  trackingTrigger: String,
  custom: String
})

projectSchema.plugin(findOrCreate);
module.exports = mongoose.model('Project', projectSchema);
