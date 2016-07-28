var mongoose = require('mongoose');
var findOneOrCreate = require('mongoose-find-one-or-create')

var projectSchema = mongoose.Schema({
  projectId: String,
  accountId: String,
  tags: Array
})

var tagSchema = mongoose.Schema({
  name: String,
  trackingId: String,
  trackingTrigger: String,
  custom: String,
  rank: Number,
  projectId: String
})

projectSchema.plugin(findOneOrCreate);
module.exports = mongoose.model({
  'Project': projectSchema,
  'Tag': tagSchema
});
