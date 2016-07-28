var mongoose = require('mongoose');
var findOneOrCreate = require('mongoose-find-one-or-create')

var projectSchema = mongoose.Schema({
  projectId: String,
  accountId: String,
  tag: String,
  trackingID: String,
  trackingTrigger: String
})

projectSchema.plugin(findOneOrCreate);
module.exports = mongoose.model('Project', projectSchema);
